import { stringify } from 'csv-stringify/sync';
import { Competition, CompetitionStatus, Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

type CompetitionModality = 'ONE_VS_ONE' | 'TWO_VS_TWO' | 'THREE_VS_THREE' | 'FOUR_VS_FOUR' | 'MULTIVERSE' | 'SURVIVAL' | 'CUSTOM';

interface CompetitionCSV {
  displayName: string;
  keyName: string;
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: CompetitionStatus;
  modality: CompetitionModality;
  image?: string;
  rating?: number;
  price?: string | null;
  prize?: string | null;
  judges: string[];
  hosts: string[];
  filmmaker?: string | null;
  music?: string | null;
  photography?: string | null;
  organizerId: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
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

// Función para validar los datos de la competencia
function validateCompetitionData(data: any): data is CompetitionCSV {
  return (
    typeof data.displayName === 'string' &&
    typeof data.keyName === 'string' &&
    typeof data.title === 'string' &&
    typeof data.description === 'string' &&
    typeof data.date === 'string' &&
    typeof data.location === 'string' &&
    typeof data.maxParticipants === 'number' &&
    typeof data.currentParticipants === 'number' &&
    typeof data.status === 'string' &&
    typeof data.modality === 'string' &&
    Array.isArray(data.judges) &&
    Array.isArray(data.hosts) &&
    typeof data.organizerId === 'string'
  );
}

// Función para actualizar las competencias con coordenadas
async function updateCompetitionsWithCoordinates() {
  try {
    const competitions = await prisma.competition.findMany();
    
    for (const competition of competitions) {
      console.log(`Processing competition: ${competition.title} at ${competition.location}`);
      
      const coordinates = await getCoordinates(competition.location);
      
      if (coordinates) {
        await prisma.$executeRaw`
          UPDATE "Competition"
          SET latitude = ${coordinates.latitude}, longitude = ${coordinates.longitude}
          WHERE id = ${competition.id}
        `;
        console.log(`Updated coordinates for ${competition.title}: ${JSON.stringify(coordinates)}`);
      } else {
        console.log(`Could not find coordinates for ${competition.title} at ${competition.location}`);
      }
    }
    
    console.log('Competition locations updated successfully');
  } catch (error) {
    console.error('Error updating competitions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la actualización
updateCompetitionsWithCoordinates();