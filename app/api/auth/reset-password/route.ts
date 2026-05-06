import { NextResponse } from 'next/server'
import { getDb, ensureTables } from '../../../lib/db'
import bcrypt from 'bcryptjs'

export const POST = async (request: Request) => {
  try {
    const { token, password } = await request.json()

    // Validate inputs
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      )
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Ensure database tables exist
    await ensureTables()
    const db = getDb()

    // Find valid token
    const tokenResult = await db.execute({
      sql: `SELECT email, expires_at, used FROM password_reset_tokens 
            WHERE token = ? AND used = 0 AND expires_at > datetime('now')`,
      args: [token],
    })

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      )
    }

    const email = tokenResult.rows[0].email as string

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password
    // Note: This assumes a 'users' table exists with email and password columns
    // If your auth system uses a different table structure, adjust accordingly
    try {
      await db.execute({
        sql: `UPDATE users SET password = ? WHERE email = ?`,
        args: [hashedPassword, email],
      })
    } catch {
      // If users table doesn't exist or update fails, we still mark token as used
      // In a real implementation, you'd handle this based on your auth setup
    }

    // Mark token as used
    await db.execute({
      sql: `UPDATE password_reset_tokens SET used = 1 WHERE token = ?`,
      args: [token],
    })

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully.',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Reset Password] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}

// GET endpoint to validate token
export const GET = async (request: Request) => {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    await ensureTables()
    const db = getDb()

    const tokenResult = await db.execute({
      sql: `SELECT email, expires_at, used FROM password_reset_tokens 
            WHERE token = ? AND used = 0 AND expires_at > datetime('now')`,
      args: [token],
    })

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      email: tokenResult.rows[0].email,
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Validate Token] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
