/**
 * Turso Database API Service
 * 
 * Production-ready database service layer for the Forza Color Universe platform.
 * Provides typed, safe access to all Turso-backed features:
 *   - Community tunes (CRUD + voting)
 *   - Favorites sync & analytics
 *   - Color analytics tracking
 *   - Community posts (Pit Stop feed)
 *   - User scans (Image-to-Paint history)
 *
 * Uses the shared db.ts singleton — works with cloud Turso or local SQLite.
 */

import { getDb, ensureTables } from '../app/lib/db'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommunityTune {
  id: string
  car_make: string
  car_model: string
  tune_name: string
  tuner_name: string
  share_code: string | null
  discipline: string
  pi_class: string | null
  pi_value: number | null
  tune_data: string
  votes: number
  created_at: string
}

export interface CommunityPost {
  id: string
  user_id: string
  username: string
  image_url: string
  caption: string | null
  car_name: string | null
  tune_code: string | null
  likes: number
  created_at: string
}

export interface ColorAnalyticsEntry {
  color_id: string
  action: 'view' | 'favorite' | 'copy' | 'share'
  user_id?: string
  ip_hash?: string
}

export interface FavoriteRecord {
  id: string
  car_id: string
  created_at: string
}

// ─── Database Service ─────────────────────────────────────────────────────────

class TursoService {
  private initialized = false

  /** Ensure tables exist before any operation */
  private async init(): Promise<void> {
    if (this.initialized) return
    await ensureTables()
    this.initialized = true
  }

  // ── Community Tunes ──────────────────────────────────────────────────────

  async getTunes(opts?: {
    car_make?: string
    car_model?: string
    discipline?: string
    pi_class?: string
    limit?: number
    offset?: number
    sort?: 'votes' | 'recent'
  }): Promise<{ tunes: CommunityTune[]; total: number }> {
    await this.init()
    const db = getDb()

    const conditions: string[] = []
    const args: (string | number)[] = []

    if (opts?.car_make) {
      conditions.push('car_make = ?')
      args.push(opts.car_make)
    }
    if (opts?.car_model) {
      conditions.push('car_model = ?')
      args.push(opts.car_model)
    }
    if (opts?.discipline) {
      conditions.push('discipline = ?')
      args.push(opts.discipline)
    }
    if (opts?.pi_class) {
      conditions.push('pi_class = ?')
      args.push(opts.pi_class)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const orderBy = opts?.sort === 'recent' ? 'created_at DESC' : 'votes DESC'
    const limit = opts?.limit ?? 20
    const offset = opts?.offset ?? 0

    const [dataResult, countResult] = await Promise.all([
      db.execute({
        sql: `SELECT * FROM community_tunes ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
        args: [...args, limit, offset],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as total FROM community_tunes ${where}`,
        args,
      }),
    ])

    return {
      tunes: dataResult.rows as unknown as CommunityTune[],
      total: Number(countResult.rows[0]?.total ?? 0),
    }
  }

  async getTuneById(id: string): Promise<CommunityTune | null> {
    await this.init()
    const db = getDb()
    const result = await db.execute({ sql: 'SELECT * FROM community_tunes WHERE id = ?', args: [id] })
    return (result.rows[0] as unknown as CommunityTune) ?? null
  }

  async createTune(tune: Omit<CommunityTune, 'votes' | 'created_at'>): Promise<CommunityTune> {
    await this.init()
    const db = getDb()

    await db.execute({
      sql: `INSERT INTO community_tunes (id, car_make, car_model, tune_name, tuner_name, share_code, discipline, pi_class, pi_value, tune_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        tune.id,
        tune.car_make,
        tune.car_model,
        tune.tune_name,
        tune.tuner_name,
        tune.share_code,
        tune.discipline,
        tune.pi_class,
        tune.pi_value,
        tune.tune_data,
      ],
    })

    return (await this.getTuneById(tune.id))!
  }

  async voteTune(id: string, direction: 'up' | 'down'): Promise<{ votes: number }> {
    await this.init()
    const db = getDb()
    const delta = direction === 'up' ? 1 : -1

    await db.execute({
      sql: 'UPDATE community_tunes SET votes = MAX(0, votes + ?) WHERE id = ?',
      args: [delta, id],
    })

    const result = await db.execute({ sql: 'SELECT votes FROM community_tunes WHERE id = ?', args: [id] })
    return { votes: Number(result.rows[0]?.votes ?? 0) }
  }

  async deleteTune(id: string): Promise<boolean> {
    await this.init()
    const db = getDb()
    const result = await db.execute({ sql: 'DELETE FROM community_tunes WHERE id = ?', args: [id] })
    return result.rowsAffected > 0
  }

  // ── Community Posts (Pit Stop) ───────────────────────────────────────────

  async getPosts(opts?: {
    limit?: number
    offset?: number
    user_id?: string
  }): Promise<{ posts: CommunityPost[]; total: number }> {
    await this.init()
    const db = getDb()

    const conditions: string[] = []
    const args: (string | number)[] = []

    if (opts?.user_id) {
      conditions.push('user_id = ?')
      args.push(opts.user_id)
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const limit = opts?.limit ?? 20
    const offset = opts?.offset ?? 0

    const [dataResult, countResult] = await Promise.all([
      db.execute({
        sql: `SELECT * FROM community_posts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
        args: [...args, limit, offset],
      }),
      db.execute({
        sql: `SELECT COUNT(*) as total FROM community_posts ${where}`,
        args,
      }),
    ])

    return {
      posts: dataResult.rows as unknown as CommunityPost[],
      total: Number(countResult.rows[0]?.total ?? 0),
    }
  }

  async createPost(post: Omit<CommunityPost, 'likes' | 'created_at'>): Promise<CommunityPost> {
    await this.init()
    const db = getDb()

    await db.execute({
      sql: `INSERT INTO community_posts (id, user_id, username, image_url, caption, car_name, tune_code)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [post.id, post.user_id, post.username, post.image_url, post.caption, post.car_name, post.tune_code],
    })

    const result = await db.execute({ sql: 'SELECT * FROM community_posts WHERE id = ?', args: [post.id] })
    return result.rows[0] as unknown as CommunityPost
  }

  async likePost(postId: string, userId: string): Promise<{ likes: number; liked: boolean }> {
    await this.init()
    const db = getDb()

    // Check if already liked
    const existing = await db.execute({
      sql: 'SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?',
      args: [postId, userId],
    })

    if (existing.rows.length > 0) {
      // Unlike
      await db.execute({ sql: 'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?', args: [postId, userId] })
      await db.execute({ sql: 'UPDATE community_posts SET likes = MAX(0, likes - 1) WHERE id = ?', args: [postId] })
      const result = await db.execute({ sql: 'SELECT likes FROM community_posts WHERE id = ?', args: [postId] })
      return { likes: Number(result.rows[0]?.likes ?? 0), liked: false }
    } else {
      // Like
      await db.execute({ sql: 'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)', args: [postId, userId] })
      await db.execute({ sql: 'UPDATE community_posts SET likes = likes + 1 WHERE id = ?', args: [postId] })
      const result = await db.execute({ sql: 'SELECT likes FROM community_posts WHERE id = ?', args: [postId] })
      return { likes: Number(result.rows[0]?.likes ?? 0), liked: true }
    }
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    await this.init()
    const db = getDb()
    const result = await db.execute({
      sql: 'DELETE FROM community_posts WHERE id = ? AND user_id = ?',
      args: [postId, userId],
    })
    return result.rowsAffected > 0
  }

  // ── Favorites ────────────────────────────────────────────────────────────

  async getFavorites(userId: string): Promise<FavoriteRecord[]> {
    await this.init()
    const db = getDb()
    const result = await db.execute({
      sql: 'SELECT * FROM favorites WHERE id LIKE ? ORDER BY created_at DESC',
      args: [`${userId}_%`],
    })
    return result.rows as unknown as FavoriteRecord[]
  }

  async toggleFavorite(userId: string, carId: string): Promise<{ favorited: boolean }> {
    await this.init()
    const db = getDb()
    const compositeId = `${userId}_${carId}`

    const existing = await db.execute({
      sql: 'SELECT 1 FROM favorites WHERE id = ?',
      args: [compositeId],
    })

    if (existing.rows.length > 0) {
      await db.execute({ sql: 'DELETE FROM favorites WHERE id = ?', args: [compositeId] })
      return { favorited: false }
    } else {
      await db.execute({
        sql: 'INSERT INTO favorites (id, car_id) VALUES (?, ?)',
        args: [compositeId, carId],
      })
      return { favorited: true }
    }
  }

  // ── Color Analytics ──────────────────────────────────────────────────────

  async trackColorAction(entry: ColorAnalyticsEntry): Promise<void> {
    await this.init()
    const db = getDb()

    await db.execute({
      sql: 'INSERT INTO color_analytics (color_id, action, user_id, ip_hash) VALUES (?, ?, ?, ?)',
      args: [entry.color_id, entry.action, entry.user_id ?? null, entry.ip_hash ?? null],
    })
  }

  async getPopularColors(limit = 20): Promise<Array<{ color_id: string; count: number }>> {
    await this.init()
    const db = getDb()

    const result = await db.execute({
      sql: `SELECT color_id, COUNT(*) as count 
            FROM color_analytics 
            WHERE action IN ('view', 'favorite')
            GROUP BY color_id 
            ORDER BY count DESC 
            LIMIT ?`,
      args: [limit],
    })

    return result.rows.map(r => ({
      color_id: r.color_id as string,
      count: Number(r.count),
    }))
  }

  // ── Aggregated Stats ─────────────────────────────────────────────────────

  async getStats(type: string): Promise<Record<string, unknown> | null> {
    await this.init()
    const db = getDb()
    const result = await db.execute({
      sql: 'SELECT data, updated_at FROM aggregated_stats WHERE type = ? ORDER BY updated_at DESC LIMIT 1',
      args: [type],
    })

    if (result.rows.length === 0) return null
    return JSON.parse(result.rows[0].data as string)
  }

  async updateStats(type: string, data: Record<string, unknown>): Promise<void> {
    await this.init()
    const db = getDb()

    await db.execute({
      sql: `INSERT INTO aggregated_stats (type, data, updated_at)
            VALUES (?, ?, datetime('now'))`,
      args: [type, JSON.stringify(data)],
    })
  }

  // ── Health Check ─────────────────────────────────────────────────────────

  async healthCheck(): Promise<{ ok: boolean; tables: string[]; mode: string }> {
    await this.init()
    const db = getDb()

    const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    const tables = result.rows.map(r => r.name as string)

    const mode = process.env.TURSO_DATABASE_URL &&
      process.env.TURSO_DATABASE_URL !== 'your_turso_database_url_here'
      ? 'cloud'
      : 'local'

    return { ok: true, tables, mode }
  }
}

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const tursoService = new TursoService()
export default tursoService
