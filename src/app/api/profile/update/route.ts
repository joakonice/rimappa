import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Verificar si el email ya está en uso por otro usuario
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: {
          id: session.user.id
        }
      }
    });

    if (existingUser) {
      return new NextResponse('Email already in use', { status: 400 });
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name,
        email,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[PROFILE_UPDATE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 