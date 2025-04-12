import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CompetitionCard from '@/components/CompetitionCard';
import { Competition, Participation, User } from '@prisma/client';

type CompetitionWithRelations = {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  image: string | null;
  rating: number | null;
  price: string | null;
  prize: string | null;
  judges: string[];
  hosts: string[];
  filmmaker: string | null;
  music: string | null;
  photography: string | null;
  createdAt: Date;
  updatedAt: Date;
  organizerId: string;
  organizer: Pick<User, 'id' | 'name'>;
  participants: Participation[];
};

export default async function CompetitionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const competitions = await prisma.competition.findMany({
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
        },
      },
      participants: true,
    },
  }) as CompetitionWithRelations[];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Competencias</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((competition) => (
          <CompetitionCard
            key={competition.id}
            competition={{
              id: competition.id,
              title: competition.title,
              description: competition.description,
              date: competition.date.toISOString(),
              location: competition.location,
              maxParticipants: competition.maxParticipants,
              currentParticipants: competition.currentParticipants,
              status: competition.status,
              organizer: competition.organizer,
              participants: competition.participants,
              image: competition.image || '/images/competitions/default.jpg',
              rating: competition.rating || 4.5,
              price: competition.price || 'Gratis',
              details: {
                schedule: [
                  { time: '17:00 a 18:00', price: competition.price || 'Gratis' }
                ],
                prize: competition.prize || 'A definir',
                judges: competition.judges || [],
                hosts: competition.hosts || [],
                extras: {
                  filmmaker: competition.filmmaker || '',
                  music: competition.music || '',
                  photography: competition.photography || ''
                }
              }
            }}
          />
        ))}
      </div>
    </div>
  );
} 