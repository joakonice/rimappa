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
        console.log('Intentando autorizar con credenciales:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Credenciales faltantes');
          throw new Error('Email y contraseña son requeridos');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user) {
          console.log('Usuario no encontrado');
          throw new Error('Usuario no encontrado');
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log('Contraseña incorrecta');
          throw new Error('Contraseña incorrecta');
        }

        console.log('Usuario autorizado:', user.email);
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
      console.log('JWT Callback - Token:', token);
      console.log('JWT Callback - User:', user);
      
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Session:', session);
      console.log('Session Callback - Token:', token);
      
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true
}; 