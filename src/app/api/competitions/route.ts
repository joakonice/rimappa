import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

const competitionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  date: z.string().transform((str) => new Date(str)),
  location: z.string().min(3),
  maxParticipants: z.number().min(2).max(64),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ORGANIZER') {
      return NextResponse.json(
        { error: 'Solo los organizadores pueden crear competencias' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = competitionSchema.parse(body);

    const competition = await prisma.competition.create({
      data: {
        ...validatedData,
        organizerId: session.user.id,
        status: 'OPEN',
      },
    });

    return NextResponse.json(competition, { status: 201 });
  } catch (error) {
    console.error('Error creating competition:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Error al crear la competencia' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const organizerId = searchParams.get('organizerId');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (organizerId) {
      where.organizerId = organizerId;
    }

    const competitions = await prisma.competition.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
        participants: {
          select: {
            id: true,
            status: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(competitions);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    return NextResponse.json(
      { error: 'Error al obtener las competencias' },
      { status: 500 }
    );
  }
} 