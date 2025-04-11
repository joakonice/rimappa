import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CompetitionCard, { CompetitionCardProps } from '@/components/CompetitionCard';
import Link from 'next/link';

export default async function CompetitionsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Competencias</h1>
          <p>Debes iniciar sesión para ver las competencias.</p>
        </div>
      </div>
    );
  }

  const competitions = await prisma.competition.findMany({
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
        },
      },
      participants: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Competencias</h1>
          {session.user.role === 'ORGANIZER' && (
            <Link
              href="/competitions/new"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            >
              Crear Competencia
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition: CompetitionCardProps['competition']) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </div>
      </div>
    </div>
  );
} 