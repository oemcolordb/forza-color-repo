import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '../../../lib/db'
import { randomBytes } from 'crypto'

// Generate a secure random token
function generateToken(): string {
  return randomBytes(32).toString('hex')
}

// Send password reset email using Resend or fallback to console
async function sendResetEmail(email: string, token: string): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://forzacoloruniverse.vercel.app'}/reset-password?token=${token}`

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password for your Forza Color Universe account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
      <p>Or copy and paste this link:</p>
      <code style="background-color: #f3f4f6; padding: 8px 12px; border-radius: 4px; word-break: break-all;">${resetUrl}</code>
      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        This link will expire in 1 hour.<br>
        If you didn't request this, please ignore this email.
      </p>
    </div>
  `

  const resendApiKey = process.env.RESEND_API_KEY

  if (resendApiKey && resendApiKey !== 'your_resend_api_key') {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Forza Color Universe <noreply@forzacoloruniverse.com>',
          to: email,
          subject: 'Reset your password',
          html: emailHtml,
        }),
      })

      if (response.ok) {
        return true
      }
    } catch {
      // Fall through to console fallback
    }
  }

  // Development fallback: log to console
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('\n========== PASSWORD RESET EMAIL ==========')
    // eslint-disable-next-line no-console
    console.log(`To: ${email}`)
    // eslint-disable-next-line no-console
    console.log(`Reset URL: ${resetUrl}`)
    // eslint-disable-next-line no-console
    console.log('==========================================\n')
    return true
  }

  return false
}

export const POST = async (request: Request) => {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim()

    // Ensure database tables exist
    await ensureTables()
    const db = getDb()

    // Generate token
    const token = generateToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1) // 1 hour expiration

    // Store token in database
    try {
      await db.execute({
        sql: `INSERT INTO password_reset_tokens (id, email, token, expires_at, used)
              VALUES (lower(hex(randomblob(16))), ?, ?, ?, 0)`,
        args: [normalizedEmail, token, expiresAt.toISOString()],
      })
    } catch {
      // If insert fails, we still return generic message for security
    }

    // Send email
    const emailSent = await sendResetEmail(normalizedEmail, token)

    if (!emailSent && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Unable to send reset email. Please try again later.' },
        { status: 500 }
      )
    }

    // Always return success to prevent email enumeration attacks
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive password reset instructions.',
    })
  } catch (error) {
     
    console.error('[Forgot Password] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
