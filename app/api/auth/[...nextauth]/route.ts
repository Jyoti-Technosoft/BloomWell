import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { postgresDb } from '../../../lib/postgres-db';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user in PostgreSQL database
          const user = await postgresDb.users.findByEmail(credentials.email);
          
          if (!user) {
            return null;
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
          if (!isPasswordValid) {
            return null;
          }

          // Return user object for NextAuth
          return { 
            id: user.id, 
            name: user.full_name, 
            email: user.email 
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
