import { NextAuthOptions } from "next-auth";
import { compare } from "bcrypt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import { UserRole } from "@prisma/client";

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET no está configurado');
}

if (!process.env.NEXTAUTH_URL) {
  throw new Error('NEXTAUTH_URL no está configurado');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('Auth - Intentando autorizar con credenciales:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Auth - Credenciales faltantes');
          throw new Error('Email y contraseña son requeridos');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          console.log('Auth - Usuario no encontrado');
          throw new Error('Usuario no encontrado');
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log('Auth - Contraseña incorrecta');
          throw new Error('Contraseña incorrecta');
        }

        console.log('Auth - Usuario autorizado:', user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('Auth - JWT Callback - Token:', JSON.stringify(token, null, 2));
      console.log('Auth - JWT Callback - User:', user ? JSON.stringify(user, null, 2) : 'No user');
      
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Auth - Session Callback - Session:', JSON.stringify(session, null, 2));
      console.log('Auth - Session Callback - Token:', JSON.stringify(token, null, 2));
      
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as UserRole,
        },
      };
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
}; 