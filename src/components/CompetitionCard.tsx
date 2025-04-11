'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Link from 'next/link';

export interface CompetitionCardProps {
  competition: {
    id: string;
    title: string;
    description: string;
    date: string;
    location: string;
    maxParticipants: number;
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
    try {
      setIsLoading(true);
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
        const error = await response.json();
        throw new Error(error.error);
      }

      toast.success('Solicitud de participación enviada');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al solicitar participación');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{competition.title}</h3>
          <p className="text-gray-400 mt-1">{competition.description}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            competition.status === 'OPEN'
              ? 'bg-green-100 text-green-800'
              : competition.status === 'IN_PROGRESS'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {competition.status === 'OPEN'
            ? 'Abierta'
            : competition.status === 'IN_PROGRESS'
            ? 'En Proceso'
            : 'Finalizada'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-400">Fecha</p>
          <p className="text-white">
            {format(new Date(competition.date), "d 'de' MMMM, yyyy", {
              locale: es,
            })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Ubicación</p>
          <p className="text-white">{competition.location}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Organizador</p>
          <p className="text-white">{competition.organizer.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Participantes</p>
          <p className="text-white">
            {competition.participants.length}/{competition.maxParticipants}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Link
          href={`/competitions/${competition.id}`}
          className="text-purple-400 hover:text-purple-300"
        >
          Ver detalles
        </Link>

        {isCompetitor && competition.status === 'OPEN' && !currentParticipant && (
          <button
            onClick={handleParticipate}
            disabled={isLoading || isFull}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isFull
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isLoading
              ? 'Solicitando...'
              : isFull
              ? 'Sin cupos'
              : 'Solicitar Participar'}
          </button>
        )}

        {currentParticipant && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentParticipant.status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-800'
                : currentParticipant.status === 'ACCEPTED'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {currentParticipant.status === 'PENDING'
              ? 'Solicitud Pendiente'
              : currentParticipant.status === 'ACCEPTED'
              ? 'Participación Aceptada'
              : 'Solicitud Rechazada'}
          </span>
        )}
      </div>
    </div>
  );
} 