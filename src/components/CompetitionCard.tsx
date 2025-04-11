'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export interface CompetitionCardProps {
  competition: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    maxParticipants: number;
    currentParticipants: number;
    status: string;
    organizer: {
      id: string;
      name: string;
    };
    participants: {
      id: string;
      status: string;
    }[];
  };
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const isOrganizer = session?.user?.role === 'ORGANIZER';
  const isCompetitor = session?.user?.role === 'COMPETITOR';
  const currentParticipant = competition.participants.find(
    (p) => p.id === session?.user?.id
  );
  const isFull = competition.participants.length >= competition.maxParticipants;

  const handleParticipate = async () => {
    if (!session) {
      toast.error('Debes iniciar sesión para participar');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/participations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          competitionId: competition.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al solicitar participación');
      }

      toast.success('Solicitud de participación enviada');
    } catch (error) {
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {competition.title}
        </h3>
        <p className="text-gray-600 mb-4">{competition.description}</p>
        <div className="space-y-2">
          <p className="text-gray-700 flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
            {format(new Date(competition.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
          <p className="text-gray-700 flex items-center">
            <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
            {competition.location}
          </p>
          <p className="text-gray-700 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-gray-400" />
            {competition.currentParticipants}/{competition.maxParticipants} participantes
          </p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Organiza: {competition.organizer.name}
          </div>
          {!isOrganizer && (
            <button
              onClick={handleParticipate}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                isLoading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isLoading ? 'Procesando...' : 'Participar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 