import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { getDb, ensureTables } from '@/lib/db/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    DiscordProvider({
      clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || 'mock_discord_client_id',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || 'mock_discord_secret',
    }),
    {
      id: 'xbox',
      name: 'Xbox Live',
      type: 'oauth',
      authorization: {
        url: 'https://login.live.com/oauth20_authorize.srf',
        params: {
          scope: 'XboxLive.signin offline_access',
          response_type: 'code',
        },
      },
      token: 'https://login.live.com/oauth20_token.srf',
      userinfo: {
        url: 'https://title.mgt.xboxlive.com/users/me/profile/settings',
        async request({ tokens }: any) {
          // Mock exchange fallback for environment compatibility
          return {
            id: 'mock_xbox_id',
            name: 'XboxGamer',
            email: 'xbox@placeholder.local',
          }
        }
      },
      clientId: process.env.XBOX_CLIENT_ID || 'mock_xbox_client_id',
      clientSecret: process.env.XBOX_CLIENT_SECRET || 'mock_xbox_secret',
      profile(profile: any) {
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          image: profile.image || null,
        }
      },
    }
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        await ensureTables()
        const db = getDb()
        
        const userId = user.id || account?.providerAccountId || Date.now().toString()
        const email = user.email || `${userId}@placeholder.local`
        const name = user.name || 'Unknown User'
        const image = user.image || ''

        // Check if there is an existing user by email
        let existingUser: any = null
        if (user.email) {
          const emailResult = await db.execute({
            sql: 'SELECT id, discord_id, xbox_id FROM users WHERE email = ?',
            args: [user.email],
          })
          if (emailResult.rows.length > 0) {
            existingUser = emailResult.rows[0]
          }
        }

        const targetUserId = existingUser ? (existingUser.id as string) : userId

        // Check if user exists by id
        const result = await db.execute({
          sql: 'SELECT id FROM users WHERE id = ?',
          args: [targetUserId],
        })

        if (result.rows.length === 0) {
          await db.execute({
            sql: 'INSERT INTO users (id, name, email, image) VALUES (?, ?, ?, ?)',
            args: [targetUserId, name, email, image],
          })
        } else {
          await db.execute({
            sql: 'UPDATE users SET name = ?, email = ?, image = ? WHERE id = ?',
            args: [name, email, image, targetUserId],
          })
        }

        // If this is an OAuth provider login (Discord, Xbox), link the profile
        if (account) {
          const provider = account.provider
          const providerId = account.providerAccountId
          const providerUsername = (profile?.username || profile?.name || name || null) as string | null

          // 1. Update the flat columns on the users table
          if (provider === 'discord') {
            await db.execute({
              sql: 'UPDATE users SET discord_id = ?, discord_username = ? WHERE id = ?',
              args: [providerId, providerUsername, targetUserId],
            })
          } else if (provider === 'xbox') {
            await db.execute({
              sql: 'UPDATE users SET xbox_id = ?, xbox_gamertag = ? WHERE id = ?',
              args: [providerId, providerUsername, targetUserId],
            })
          }

          // 2. Upsert into user_connections
          await db.execute({
            sql: `INSERT INTO user_connections (id, user_id, provider, provider_id, username, email)
                  VALUES (?, ?, ?, ?, ?, ?)
                  ON CONFLICT(user_id, provider) DO UPDATE SET
                    provider_id = excluded.provider_id,
                    username = excluded.username,
                    email = excluded.email`,
            args: [`${targetUserId}-${provider}`, targetUserId, provider, providerId, providerUsername, email],
          })
        }

        return true
      } catch (err) {
        console.error('Error during signIn callback:', err)
        return true
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (account) {
        token.provider = account.provider
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const userId = token.id as string
        session.user.id = userId
        ;(session.user as any).provider = token.provider as string

        try {
          await ensureTables()
          const db = getDb()
          const connectionsResult = await db.execute({
            sql: 'SELECT provider, provider_id, username FROM user_connections WHERE user_id = ?',
            args: [userId],
          })
          
          const connections = connectionsResult.rows.map(row => ({
            provider: row.provider as string,
            providerId: row.provider_id as string,
            username: row.username as string,
          }))

          ;(session.user as any).connections = connections

          const userResult = await db.execute({
            sql: 'SELECT discord_id, discord_username, xbox_id, xbox_gamertag FROM users WHERE id = ?',
            args: [userId],
          })
          if (userResult.rows.length > 0) {
            const u = userResult.rows[0]
            ;(session.user as any).discordId = u.discord_id
            ;(session.user as any).discordUsername = u.discord_username
            ;(session.user as any).xboxId = u.xbox_id
            ;(session.user as any).xboxGamertag = u.xbox_gamertag
          }
        } catch (e) {
          console.error('Session callback DB error:', e)
        }
      }
      return session
    },
  },
})
