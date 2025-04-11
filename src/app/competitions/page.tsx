'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import CompetitionCard from '@/components/CompetitionCard';

interface Competition {
  id: string;
  title: string;
  description: string;
  date: Date;
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
}

export default function CompetitionsPage() {
  const { data: session } = useSession();
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    // Aquí iría la llamada a la API para obtener las competencias
    // Por ahora usamos datos de ejemplo
    setCompetitions([
      {
        id: '1',
        title: 'Freestyle Master Series Argentina',
        description: 'La competencia más importante de freestyle rap en Argentina',
        date: new Date('2024-04-15'),
        location: 'Teatro Gran Rex, CABA',
        maxParticipants: 16,
        currentParticipants: 8,
        status: 'OPEN',
        organizer: {
          name: 'Papo MC',
          id: '1',
        },
        participants: []
      },
      // ... otros datos de ejemplo
    ]);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Competencias</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.map((competition) => (
          <CompetitionCard 
            key={competition.id} 
            competition={{
              ...competition,
              date: competition.date.toISOString() // Convertimos la fecha a string
            }} 
          />
        ))}
      </div>
    </div>
  );
} 