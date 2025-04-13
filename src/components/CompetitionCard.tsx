'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Calendar, MapPin, Users, Clock, Trophy } from 'lucide-react';

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
    image: string;
    rating: number;
    price: string;
    details?: {
      schedule: {
        time: string;
        price: string;
      }[];
      prize: string;
      judges: string[];
      hosts: string[];
      extras: {
        filmmaker: string;
        music: string;
        photography: string;
      };
    };
  };
}

export default function CompetitionCard({ competition }: CompetitionCardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const isOrganizer = session?.user?.role === 'ORGANIZER';
  const isCompetitor = session?.user?.role === 'COMPETITOR';
  const currentParticipant = competition.participants.find(
    (p) => p.id === session?.user?.id
  );
  const isFull = competition.participants.length >= competition.maxParticipants;
  const defaultImage = '/images/competitions/default.jpg';
  const [imageError, setImageError] = useState(false);

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
    <div 
      className="relative w-full h-64 rounded-lg overflow-hidden cursor-pointer group bg-black"
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Background Image */}
      <Image
        src={imageError ? defaultImage : (competition.image || defaultImage)}
        alt={competition.title}
        fill
        className="object-cover transition-transform group-hover:scale-105 opacity-90"
        onError={() => setImageError(true)}
        priority
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      
      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        {/* Top Row - Title with neon effect */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.8)] tracking-wider">
            {competition.title}
          </h2>
          <p className="text-white text-lg mt-1">{competition.description}</p>
        </div>
        
        {/* Middle - Date */}
        <div className="text-center">
          <div className="inline-block bg-yellow-400/20 backdrop-blur-sm px-6 py-2 rounded-full">
            <span className="text-white text-xl font-medium">
              {format(new Date(competition.date), "d 'de' MMMM", { locale: es })}
            </span>
          </div>
        </div>

        {/* Bottom Info */}
        <div>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
            <span className="bg-black/50 backdrop-blur-sm px-4 py-1 rounded-full text-white">
              <MapPin className="w-4 h-4 inline mr-1" />
              {competition.location}
            </span>
          </div>
          
          {/* Price and Schedule */}
          <div className="text-center space-y-1">
            {competition.details?.schedule.map((s, i) => (
              <div key={i} className="text-white text-sm">
                <span className="text-[#39FF14]">{s.time}</span> - {s.price}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="absolute inset-0 bg-black/95 p-6 flex flex-col gap-4 overflow-y-auto">
          {/* Prize Section */}
          <div className="text-center">
            <h4 className="text-[#39FF14] text-2xl font-bold mb-2">PREMIO</h4>
            <p className="text-white text-xl">{competition.details?.prize}</p>
          </div>

          {/* Judges Section */}
          <div className="text-center">
            <h4 className="text-yellow-400 text-xl font-bold mb-2">JURADOS</h4>
            <p className="text-white">{competition.details?.judges.join(' • ')}</p>
          </div>

          {/* Hosts and Extras */}
          <div className="text-center text-sm text-gray-300 space-y-2">
            <p>
              <span className="text-yellow-400">Host:</span> {competition.details?.hosts.join(' & ')}
            </p>
            <p>
              <span className="text-yellow-400">Filmmaker:</span> {competition.details?.extras.filmmaker}
            </p>
            <p>
              <span className="text-yellow-400">Música:</span> {competition.details?.extras.music}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleParticipate();
            }}
            disabled={isLoading}
            className="mt-auto bg-[#39FF14] text-black py-3 rounded-full hover:bg-[#32E012] transition-colors font-bold text-lg"
          >
            {isLoading ? 'Procesando...' : 'INSCRIBIRSE'}
          </button>
        </div>
      )}
    </div>
  );
} 