import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'COMPETITOR') {
      return NextResponse.json(
        { error: 'Solo los competidores pueden solicitar participar' },
        { status: 403 }
      );
    }

    const { competitionId } = await request.json();

    // Verificar si la competencia existe y está abierta
    const competition = await prisma.competition.findUnique({
      where: { id: competitionId },
      include: {
        participants: true,
      },
    });

    if (!competition) {
      return NextResponse.json(
        { error: 'Competencia no encontrada' },
        { status: 404 }
      );
    }

    if (competition.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'La competencia no está abierta para participaciones' },
        { status: 400 }
      );
    }

    // Verificar si ya está participando
    const existingParticipation = await prisma.participation.findUnique({
      where: {
        userId_competitionId: {
          userId: session.user.id,
          competitionId,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'Ya has solicitado participar en esta competencia' },
        { status: 400 }
      );
    }

    // Verificar si hay cupos disponibles
    if (competition.participants.length >= competition.maxParticipants) {
      return NextResponse.json(
        { error: 'No hay cupos disponibles' },
        { status: 400 }
      );
    }

    // Crear la participación
    const participation = await prisma.participation.create({
      data: {
        userId: session.user.id,
        competitionId,
        status: 'PENDING',
      },
    });

    return NextResponse.json(participation, { status: 201 });
  } catch (error) {
    console.error('Error creating participation:', error);
    return NextResponse.json(
      { error: 'Error al solicitar participación' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const competitionId = searchParams.get('competitionId');
    const userId = searchParams.get('userId');

    const where: any = {};
    if (competitionId) {
      where.competitionId = competitionId;
    }
    if (userId) {
      where.userId = userId;
    }

    const participations = await prisma.participation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        competition: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(participations);
  } catch (error) {
    console.error('Error fetching participations:', error);
    return NextResponse.json(
      { error: 'Error al obtener las participaciones' },
      { status: 500 }
    );
  }
} 