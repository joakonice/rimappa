import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'csv-parse/sync';
import { CompetitionModality } from '@prisma/client';

interface CompetitionCSV {
  displayName: string;
  keyName: string;
  eventDate: string;
  createdAt: string;
  modality: CompetitionModality;
  judges: string;
  location: string;
  price: string;
  description: string;
  flyerPath: string;
}

export function generateKeyName(displayName: string): string {
  return displayName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function getFlyerPath(keyName: string, extension: string = 'jpg'): string {
  return `/images/competitions/flyers/${keyName}.${extension}`;
}

export async function importCompetitionsFromCSV(filePath: string) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  }) as CompetitionCSV[];

  for (const record of records) {
    const keyName = generateKeyName(record.displayName);
    
    await prisma.competition.create({
      data: {
        displayName: record.displayName,
        keyName,
        title: record.displayName,
        description: record.description,
        date: new Date(record.eventDate),
        createdAt: new Date(record.createdAt),
        location: record.location,
        modality: record.modality as CompetitionModality,
        price: record.price,
        judges: record.judges ? record.judges.split(',').map(j => j.trim()) : [],
        image: record.flyerPath || getFlyerPath(keyName),
        maxParticipants: 32, // Default value
        organizer: {
          connect: {
            id: '1' // Default organizer ID
          }
        }
      }
    });
  }
}

export async function exportCompetitionsToCSV(outputPath: string) {
  const competitions = await prisma.competition.findMany();
  
  const csvData = competitions.map(comp => ({
    displayName: comp.displayName,
    keyName: comp.keyName,
    eventDate: comp.date.toISOString(),
    createdAt: comp.createdAt.toISOString(),
    modality: comp.modality,
    judges: comp.judges.join(', '),
    location: comp.location,
    price: comp.price || '',
    description: comp.description,
    flyerPath: comp.image || ''
  }));

  const csv = stringify(csvData, {
    header: true,
    columns: [
      'displayName',
      'keyName',
      'eventDate',
      'createdAt',
      'modality',
      'judges',
      'location',
      'price',
      'description',
      'flyerPath'
    ]
  });

  fs.writeFileSync(outputPath, csv);
}

// Example competition data
export const exampleCompetition = {
  displayName: "Dinastía Freestyle",
  keyName: "dinastiafreestyle",
  eventDate: "2024-05-01T17:00:00Z",
  createdAt: new Date().toISOString(),
  modality: "TWO_VS_TWO" as CompetitionModality,
  judges: "KIRO, DOSSANTOS, CLAP",
  location: "Plaza San Martin, Morón",
  price: "2.500",
  description: "DOS VS DOS - Fecha #4 del Torneo 10",
  flyerPath: "/images/competitions/flyers/dinastiafreestyle.jpg"
}; 