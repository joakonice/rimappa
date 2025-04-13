import { PrismaClient, CompetitionStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CompetitionRecord {
  displayName: string;
  keyName: string;
  eventDate: string;
  createdAt: string;
  modality: string;
  judges: string;
  location: string;
  price: string;
  description: string;
  flyerPath: string;
}

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

async function importCompetitions() {
  try {
    // Leer el archivo CSV
    const csvPath = path.join(process.cwd(), 'data', 'competitions.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    }) as CompetitionRecord[];

    // Procesar cada competencia
    for (const record of records) {
      console.log(`Processing competition: ${record.displayName}`);
      
      const coordinates = await getCoordinates(record.location);
      console.log(`Got coordinates for ${record.location}:`, coordinates);

      try {
        // Crear o actualizar la competencia
        const competition = await prisma.competition.create({
          data: {
            title: record.displayName,
            description: record.description,
            date: new Date(record.eventDate),
            location: record.location,
            maxParticipants: 32, // Valor por defecto
            status: CompetitionStatus.OPEN,
            organizerId: '1', // ID del organizador por defecto
            ...(coordinates && {
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            })
          }
        });
        console.log(`Successfully processed competition: ${competition.title}`);
      } catch (error) {
        console.error(`Error processing competition ${record.displayName}:`, error);
      }
    }

    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error importing competitions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la importación
importCompetitions(); 