import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CompetitionCard from '@/components/CompetitionCard';
import { Competition, Participation } from '@prisma/client';

interface CompetitionWithRelations extends Competition {
  organizer: {
    id: string;
    name: string;
  };
  participants: Participation[];
}

export default async function CompetitionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const competitions = await prisma.competition.findMany({
    include: {
      organizer: true,
      participants: true,
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Competencias</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((competition: CompetitionWithRelations) => (
          <CompetitionCard
            key={competition.id}
            competition={{
              ...competition,
              date: competition.date.toISOString(),
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