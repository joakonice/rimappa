import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import { Competition, CompetitionStatus, PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

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
  latitude: number;
  longitude: number;
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
  if (typeof data.latitude !== 'number') {
    throw new Error('Invalid latitude');
  }
  if (typeof data.longitude !== 'number') {
    throw new Error('Invalid longitude');
  }

  const competitionData: CompetitionCSV = {
    title: data.title,
    description: data.description,
    date: data.date,
    location: data.location,
    maxParticipants: data.maxParticipants,
    status: data.status || CompetitionStatus.OPEN,
    organizerId: data.organizerId,
    latitude: data.latitude,
    longitude: data.longitude
  };

  if (data.image) competitionData.image = data.image;
  if (data.rating) competitionData.rating = data.rating;
  if (data.price) competitionData.price = data.price;
  if (data.prize) competitionData.prize = data.prize;

  return competitionData;
}

async function upsertCompetition(data: CompetitionCSV) {
  const { organizerId, ...competitionData } = data;

  return await prisma.competition.upsert({
    where: {
      id: data.title.toLowerCase().replace(/\s+/g, '-'),
    },
    update: {
      ...competitionData,
      date: new Date(competitionData.date),
      organizer: {
        connect: { id: organizerId }
      }
    },
    create: {
      id: data.title.toLowerCase().replace(/\s+/g, '-'),
      ...competitionData,
      date: new Date(competitionData.date),
      organizer: {
        connect: { id: organizerId }
      }
    },
  });
}

export async function readCompetitionsFromCSV(): Promise<CompetitionCSV[]> {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'competitions.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ';'
    });
    
    return records.map((record: any) => {
      try {
        return validateCompetitionData({
          ...record,
          maxParticipants: parseInt(record.maxParticipants),
          rating: record.rating ? parseFloat(record.rating) : undefined,
          latitude: parseFloat(record.latitude),
          longitude: parseFloat(record.longitude)
        });
      } catch (error) {
        console.error('Error validating competition:', record, error);
        return null;
      }
    }).filter((record: CompetitionCSV | null): record is CompetitionCSV => record !== null);
  } catch (error) {
    console.error('Error reading competitions from CSV:', error);
    return [];
  }
}

export async function writeCompetitionsToCSV(competitions: CompetitionCSV[]) {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'competitions.csv');
    const csvContent = stringify(competitions, { 
      header: true,
      delimiter: ';'
    });
    fs.writeFileSync(csvPath, csvContent);
    console.log('Competitions written to CSV successfully');
  } catch (error) {
    console.error('Error writing competitions to CSV:', error);
  }
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