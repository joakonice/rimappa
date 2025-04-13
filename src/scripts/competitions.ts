import { stringify } from 'csv-stringify/sync';
import { Competition, CompetitionStatus, Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const prismaClient = new PrismaClient();

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
}

// ... rest of the file remains the same ...