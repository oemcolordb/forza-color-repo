import { NextResponse } from 'next/server'
import { scanInputSchema, userIdSchema, validateInput, sanitizeUserId, sanitizeFileName } from '@/app/lib/validation'
import { rateLimiter, getClientIp, RATE_LIMITS, createRateLimitHeaders } from '@/app/lib/rateLimit'
import { validateCsrfToken } from '@/app/lib/csrf'
import { getDbClient } from '@/app/lib/db'

const client = getDbClient()

export async function GET(request: Request) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  // Rate limiting
  const clientIp = getClientIp(request)
  const rateLimit = rateLimiter.check(clientIp, RATE_LIMITS.GET_SCANS.limit, RATE_LIMITS.GET_SCANS.windowMs)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: createRateLimitHeaders(rateLimit)
      }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    // Validate and sanitize userId
    const validation = validateInput(userIdSchema, { userId })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const sanitizedUserId = sanitizeUserId(userId)

    const result = await client.execute({
      sql: 'SELECT * FROM scans WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
      args: [sanitizedUserId],
    })

    return NextResponse.json(result.rows, {
      headers: createRateLimitHeaders(rateLimit)
    })
  } catch (error) {
    console.error('GET /api/scans error:', error)
    return NextResponse.json({ error: 'Failed to fetch scans' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  // CSRF Protection
  const csrfToken = request.headers.get('x-csrf-token')
  if (!csrfToken || !validateCsrfToken(csrfToken)) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    )
  }

  // Rate limiting - stricter for POST operations
  const clientIp = getClientIp(request)
  const rateLimit = rateLimiter.check(clientIp, RATE_LIMITS.POST_SCAN.limit, RATE_LIMITS.POST_SCAN.windowMs)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: createRateLimitHeaders(rateLimit)
      }
    )
  }

  try {
    const body = await request.json()

    // Validate input with Zod schema
    const validation = validateInput(scanInputSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { userId, imageName, extractedColors, matches, imageData } = validation.data

    // Sanitize inputs
    const sanitizedUserId = sanitizeUserId(userId)
    const sanitizedImageName = sanitizeFileName(imageName)

    // Additional validation: check image data is valid base64
    if (!imageData.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,/)) {
      return NextResponse.json({ error: 'Invalid image data format' }, { status: 400 })
    }

    const result = await client.execute({
      sql: `INSERT INTO scans (userId, imageName, extractedColors, matches, imageData, createdAt)
            VALUES (?, ?, ?, ?, ?, datetime('now'))`,
      args: [
        sanitizedUserId,
        sanitizedImageName,
        JSON.stringify(extractedColors),
        JSON.stringify(matches),
        imageData,
      ],
    })

    return NextResponse.json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Scan saved successfully',
    }, {
      headers: createRateLimitHeaders(rateLimit)
    })
  } catch (error) {
    console.error('POST /api/scans error:', error)
    return NextResponse.json({ error: 'Failed to save scan' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  if (!client) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  // CSRF Protection
  const csrfToken = request.headers.get('x-csrf-token')
  if (!csrfToken || !validateCsrfToken(csrfToken)) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    )
  }

  // Rate limiting
  const clientIp = getClientIp(request)
  const rateLimit = rateLimiter.check(clientIp, RATE_LIMITS.DELETE_SCAN.limit, RATE_LIMITS.DELETE_SCAN.windowMs)
  
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: createRateLimitHeaders(rateLimit)
      }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const scanId = searchParams.get('scanId')
    const userId = searchParams.get('userId')

    if (!scanId || !userId) {
      return NextResponse.json({ error: 'scanId and userId required' }, { status: 400 })
    }

    // Validate userId
    const validation = validateInput(userIdSchema, { userId })
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Sanitize inputs
    const sanitizedUserId = sanitizeUserId(userId)
    const sanitizedScanId = scanId.replace(/[^0-9]/g, '') // Only allow numbers for scan ID

    if (!sanitizedScanId) {
      return NextResponse.json({ error: 'Invalid scan ID' }, { status: 400 })
    }

    await client.execute({
      sql: 'DELETE FROM scans WHERE id = ? AND userId = ?',
      args: [sanitizedScanId, sanitizedUserId],
    })

    return NextResponse.json({ success: true, message: 'Scan deleted' }, {
      headers: createRateLimitHeaders(rateLimit)
    })
  } catch (error) {
    console.error('DELETE /api/scans error:', error)
    return NextResponse.json({ error: 'Failed to delete scan' }, { status: 500 })
  }
}
