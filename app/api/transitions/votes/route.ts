/**
 * Transition Votes API
 *
 * GET  /api/transitions/votes     - Get all votes and user's vote status
 * POST /api/transitions/votes     - Vote or unvote for a transition
 */

import { NextRequest, NextResponse } from 'next/server'
import { getDb, ensureTables } from '../../../lib/db'
import { cookies } from 'next/headers'
import { TransitionType, TRANSITION_METADATA } from '../../../components/transitions/PageTransitions'

// Generate a simple user ID from cookies or create new one
async function getUserId(): Promise<string> {
  const cookieStore = await cookies()
  let userId = cookieStore.get('transition_voter_id')?.value

  if (!userId) {
    userId = `voter_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    cookieStore.set('transition_voter_id', userId, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: true,
      sameSite: 'lax'
    })
  }

  return userId
}

// Get client IP for additional vote tracking
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
}

// GET - Retrieve all votes and user's vote status
export async function GET(request: NextRequest) {
  try {
    await ensureTables()
    const db = getDb()
    const userId = await getUserId()

    // Get vote counts for all transitions
    const voteCountsResult = await db.execute({
      sql: `
        SELECT transition_id, COUNT(*) as count
        FROM transition_votes
        GROUP BY transition_id
      `,
      args: []
    })

    // Build votes record
    const votes: Record<string, number> = {
      'soft-fade': 0,
      'gentle-slide': 0,
      'soft-scale': 0,
      'crossfade-blur': 0,
      'page-peel': 0,
      'reveal-wipe': 0,
      'fade-up': 0,
      'shutter-reveal': 0,
      'drop-in': 0,
      'rise-up': 0,
      'loading-pulse': 0,
      'rewind-sweep': 0,
    }

    for (const row of voteCountsResult.rows) {
      const transitionId = row.transition_id as string
      if (transitionId in votes) {
        votes[transitionId] = Number(row.count)
      }
    }

    // Get user's votes
    const userVotesResult = await db.execute({
      sql: `
        SELECT transition_id
        FROM transition_votes
        WHERE user_id = ?
      `,
      args: [userId]
    })

    const userVotes: Record<string, boolean> = {}
    for (const row of userVotesResult.rows) {
      userVotes[row.transition_id as string] = true
    }

    return NextResponse.json({
      votes,
      userVotes,
      totalVotes: Object.values(votes).reduce((a, b) => a + b, 0),
      userId // Return for debugging (can be removed in production)
    })

  } catch (error) {
    console.error('Error fetching transition votes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    )
  }
}

// POST - Vote or unvote for a transition
export async function POST(request: NextRequest) {
  try {
    await ensureTables()
    const db = getDb()
    const userId = await getUserId()
    const ipAddress = getClientIp(request)

    const body = await request.json()
    const { transitionId, action } = body

    // Validate input
    if (!transitionId || !action) {
      return NextResponse.json(
        { error: 'Missing transitionId or action' },
        { status: 400 }
      )
    }

    // Validate transition ID
    const validTransitions = TRANSITION_METADATA.map(t => t.id)
    if (!validTransitions.includes(transitionId)) {
      return NextResponse.json(
        { error: 'Invalid transition ID' },
        { status: 400 }
      )
    }

    if (action === 'vote') {
      // Try to insert vote (will fail if already voted due to UNIQUE constraint)
      try {
        const voteId = `vote_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
        await db.execute({
          sql: `
            INSERT INTO transition_votes (id, transition_id, user_id, ip_address)
            VALUES (?, ?, ?, ?)
          `,
          args: [voteId, transitionId, userId, ipAddress]
        })
      } catch (error) {
        // If unique constraint violation, user already voted
        // Just return current count
      }

    } else if (action === 'unvote') {
      // Remove user's vote
      await db.execute({
        sql: `
          DELETE FROM transition_votes
          WHERE transition_id = ? AND user_id = ?
        `,
        args: [transitionId, userId]
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "vote" or "unvote"' },
        { status: 400 }
      )
    }

    // Get updated count
    const countResult = await db.execute({
      sql: `
        SELECT COUNT(*) as count
        FROM transition_votes
        WHERE transition_id = ?
      `,
      args: [transitionId]
    })

    const newCount = Number(countResult.rows[0]?.count || 0)

    return NextResponse.json({
      success: true,
      transitionId,
      action,
      newCount
    })

  } catch (error) {
    console.error('Error handling vote:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
}
