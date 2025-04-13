import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Leer el archivo CSV
    const csvPath = path.join(process.cwd(), 'data', 'competitions.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    // Procesar cada competencia
    for (const record of records) {
      const coordinates = await getCoordinates(record.location);
      
      const competitionData: Prisma.CompetitionCreateInput = {
        title: record.title,
        description: record.description,
        date: new Date(record.date),
        location: record.location,
        maxParticipants: parseInt(record.maxParticipants),
        status: record.status,
        modality: record.modality,
        displayName: record.displayName,
        keyName: record.keyName,
        organizer: {
          connect: {
            id: record.organizerId
          }
        },
        ...(coordinates && {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        })
      };

      // Crear o actualizar la competencia
      await prisma.competition.upsert({
        where: {
          keyName: record.keyName
        },
        update: {
          ...competitionData,
          organizer: undefined
        },
        create: competitionData
      });
    }

    return NextResponse.json({ message: 'Competencias importadas exitosamente' });
  } catch (error) {
    console.error('Error importing competitions:', error);
    return NextResponse.json(
      { error: 'Error al importar competencias' },
      { status: 500 }
    );
  }
} 