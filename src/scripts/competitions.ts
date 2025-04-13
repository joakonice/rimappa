import { stringify } from 'csv-stringify/sync';
import { Competition, CompetitionStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

interface CompetitionCSV {
  title: string;
  description: string;
  date: string;
  location: string;
  maxParticipants: number;
  status: CompetitionStatus;
  image?: string;
  rating?: number;
  price?: string;
  prize?: string;
  organizerId: string;
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

function validateCompetitionData(data: any): CompetitionCSV {
  if (!data.title || typeof data.title !== 'string') {
    throw new Error('Invalid title');
  }
  if (!data.description || typeof data.description !== 'string') {
    throw new Error('Invalid description');
  }
  if (!data.date || typeof data.date !== 'string') {
    throw new Error('Invalid date');
  }
  if (!data.location || typeof data.location !== 'string') {
    throw new Error('Invalid location');
  }
  if (!data.maxParticipants || typeof data.maxParticipants !== 'number') {
    throw new Error('Invalid maxParticipants');
  }
  if (!data.organizerId || typeof data.organizerId !== 'string') {
    throw new Error('Invalid organizerId');
  }

  const competitionData: CompetitionCSV = {
    title: data.title,
    description: data.description,
    date: data.date,
    location: data.location,
    maxParticipants: data.maxParticipants,
    status: data.status || CompetitionStatus.OPEN,
    organizerId: data.organizerId,
  };

  if (data.image) competitionData.image = data.image;
  if (data.rating) competitionData.rating = data.rating;
  if (data.price) competitionData.price = data.price;
  if (data.prize) competitionData.prize = data.prize;

  return competitionData;
}

async function upsertCompetition(data: CompetitionCSV) {
  const { organizerId, ...competitionData } = data;
  
  // Obtener coordenadas para la ubicación
  const coordinates = await getCoordinates(competitionData.location);
  console.log(`Coordinates for ${competitionData.location}:`, coordinates);

  return await prisma.competition.upsert({
    where: {
      id: data.title.toLowerCase().replace(/\s+/g, '-'),
    },
    update: {
      ...competitionData,
      date: new Date(competitionData.date),
      organizer: {
        connect: { id: organizerId }
      },
      ...(coordinates && {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })
    },
    create: {
      id: data.title.toLowerCase().replace(/\s+/g, '-'),
      ...competitionData,
      date: new Date(competitionData.date),
      organizer: {
        connect: { id: organizerId }
      },
      ...(coordinates && {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })
    },
  });
}

// Función principal para procesar competencias
export async function processCompetitions(competitionsData: any[]) {
  try {
    for (const data of competitionsData) {
      const validatedData = validateCompetitionData(data);
      await upsertCompetition(validatedData);
    }
    console.log('All competitions processed successfully');
  } catch (error) {
    console.error('Error processing competitions:', error);
  } finally {
    await prisma.$disconnect();
  }
}