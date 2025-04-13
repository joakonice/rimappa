import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processCompetitions } from '@/scripts/competitions';
import { PrismaClient, UserRole } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// Función para obtener coordenadas de una ubicación usando MapTiler
async function getCoordinates(location: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const competitions = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    await processCompetitions(competitions);

    return NextResponse.json(
      { message: 'Competencias importadas exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al importar competencias:', error);
    return NextResponse.json(
      { error: 'Error al procesar el archivo' },
      { status: 500 }
    );
  }
} 