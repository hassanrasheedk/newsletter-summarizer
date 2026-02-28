import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/gmail.readonly',
          ].join(' '),
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // On first sign-in, persist tokens from the OAuth provider
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        return token
      }

      // Token still valid — return as-is
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000 - 60_000) {
        return token
      }

      // Token expired (or expiring in <60 s) — refresh it
      if (!token.refreshToken) return token

      try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken as string,
          }),
        })

        const refreshed = await response.json() as {
          access_token: string
          expires_in: number
          refresh_token?: string
        }

        if (!response.ok) throw refreshed

        return {
          ...token,
          accessToken: refreshed.access_token,
          expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
          // Google may rotate the refresh token
          refreshToken: refreshed.refresh_token ?? token.refreshToken,
        }
      } catch (err) {
        console.error('[auth] Token refresh failed:', err)
        // Keep old token; the next request will try again or force re-login
        return { ...token, error: 'RefreshAccessTokenError' }
      }
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined
      return session
    },
  },
})
