'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Map, Marker, Popup } from '@vis.gl/react-maplibre';
import { CalendarIcon, MapPinIcon, UserGroupIcon, AdjustmentsHorizontalIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Competition {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  coordinates: [number, number]; // [longitud, latitud]
  maxParticipants: number;
  currentParticipants: number;
  status: 'OPEN' | 'IN_PROGRESS' | 'FINISHED';
  organizer: {
    name: string;
    id: string;
  };
}

// Datos de ejemplo - Reemplazar con datos reales de la API
const mockCompetitions: Competition[] = [
  {
    id: '1',
    title: 'Freestyle Master Series Argentina',
    description: 'La competencia más importante de freestyle rap en Argentina',
    date: new Date('2024-04-15'),
    location: 'Teatro Gran Rex, CABA',
    coordinates: [-58.3815, -34.6037], // CABA
    maxParticipants: 16,
    currentParticipants: 8,
    status: 'OPEN',
    organizer: {
      name: 'Papo MC',
      id: '1',
    },
  },
  {
    id: '2',
    title: 'El Quinto Escalón - Edición 2024',
    description: 'El regreso de la competencia que marcó historia en el freestyle argentino',
    date: new Date('2024-05-20'),
    location: 'Parque Rivadavia, CABA',
    coordinates: [-58.4370, -34.6197], // Parque Rivadavia
    maxParticipants: 32,
    currentParticipants: 15,
    status: 'OPEN',
    organizer: {
      name: 'Alejo Acosta',
      id: '2',
    },
  },
  {
    id: '3',
    title: 'Underground Battles Palermo',
    description: 'Competencia underground en el corazón de Palermo',
    date: new Date('2024-04-25'),
    location: 'Plaza Serrano, CABA',
    coordinates: [-58.4383, -34.5875], // Plaza Serrano
    maxParticipants: 24,
    currentParticipants: 10,
    status: 'OPEN',
    organizer: {
      name: 'MKS',
      id: '3',
    },
  }
];

export default function Competitions() {
  const { data: session } = useSession();
  const isOrganizer = session?.user?.role === 'ORGANIZER';
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  
  // Nuevos estados para filtros
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'microphone' | 'beatbox'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'weekend'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'popularity' | 'date' | 'name'>('distance');
  const [searchRadius, setSearchRadius] = useState(2000); // metros
  const [searchQuery, setSearchQuery] = useState('');

  const [viewport, setViewport] = useState({
    latitude: -34.6037,
    longitude: -58.3815,
    zoom: 12
  });

  const handleMapMove = (evt: any) => {
    setViewport(evt.viewState);
  };

  const filteredCompetitions = mockCompetitions.filter(competition => {
    if (dateFilter === 'today') {
      const today = new Date();
      return competition.date.toDateString() === today.toDateString();
    }
    if (dateFilter === 'week') {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return competition.date >= today && competition.date <= nextWeek;
    }
    if (dateFilter === 'month') {
      const today = new Date();
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
      return competition.date >= today && competition.date <= nextMonth;
    }

    return true;
  });

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex h-full">
        {/* Panel lateral */}
        <div className="w-96 bg-gray-800 p-4 overflow-y-auto relative">
          {/* Header con búsqueda */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Rimappa</h1>
              {isOrganizer && (
                <Link
                  href="/dashboard/competitions/new"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm transition-colors"
                >
                  + Nueva
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar competencias..."
                className="w-full bg-gray-700 text-white rounded-full py-2 pl-10 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-white">Filtros</h2>
              {showFilters && (
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Chips de filtros */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Fecha</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'today', 'week', 'month'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter as any)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        dateFilter === filter
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {filter === 'all' ? 'Todas' :
                       filter === 'today' ? 'Hoy' :
                       filter === 'week' ? 'Esta semana' : 'Este mes'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Tipo</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTypeFilter('microphone')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      typeFilter === 'microphone'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Micrófono
                  </button>
                  <button
                    onClick={() => setTypeFilter('beatbox')}
                    className={`px-3 py-1 rounded-full text-sm ${
                      typeFilter === 'beatbox'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    BeatBox
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Ordenar por</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'distance', label: 'Cercanía' },
                    { value: 'popularity', label: 'Más popular' },
                    { value: 'date', label: 'Fecha' },
                    { value: 'name', label: 'Nombre' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value as any)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        sortBy === option.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Radio de búsqueda</label>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="500"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
                <div className="text-sm text-gray-400 mt-1">
                  {(searchRadius / 1000).toFixed(1)} km
                </div>
              </div>
            </div>
          </div>

          {/* Lista de competencias */}
          <div className="space-y-4">
            {filteredCompetitions.map((competition) => (
              <div
                key={competition.id}
                className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedCompetition(competition);
                  setViewport({
                    ...viewport,
                    latitude: competition.coordinates[1],
                    longitude: competition.coordinates[0],
                    zoom: 12
                  });
                }}
              >
                <h3 className="text-lg font-medium text-white">
                  {competition.title}
                </h3>
                <p className="mt-1 text-sm text-gray-300">
                  {competition.description}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center text-sm text-gray-400">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {format(competition.date, "d MMM", { locale: es })}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {competition.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    {competition.currentParticipants}/{competition.maxParticipants}
                  </div>
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
              </div>
            ))}
          </div>
        </div>

        {/* Mapa */}
        <div className="flex-1">
          <Map
            {...viewport}
            onMove={handleMapMove}
            style={{ width: '100%', height: '100%' }}
            mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
          >
            {/* Radio de búsqueda */}
            <div
              style={{
                position: 'absolute',
                width: `${searchRadius * 2}px`,
                height: `${searchRadius * 2}px`,
                borderRadius: '50%',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                border: '2px solid rgba(147, 51, 234, 0.5)',
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%',
                pointerEvents: 'none'
              }}
            />
            {filteredCompetitions.map((competition) => (
              <Marker
                key={competition.id}
                latitude={competition.coordinates[1]}
                longitude={competition.coordinates[0]}
              >
                <div 
                  className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs cursor-pointer"
                  onClick={() => setSelectedCompetition(competition)}
                >
                  {competition.currentParticipants}
                </div>
              </Marker>
            ))}

            {selectedCompetition && (
              <Popup
                latitude={selectedCompetition.coordinates[1]}
                longitude={selectedCompetition.coordinates[0]}
                onClose={() => setSelectedCompetition(null)}
                closeButton={true}
                closeOnClick={false}
                className="bg-gray-800 text-white"
              >
                <div className="p-2">
                  <h3 className="font-medium">{selectedCompetition.title}</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {selectedCompetition.description}
                  </p>
                  <div className="mt-2">
                    <Link
                      href={`/dashboard/competitions/${selectedCompetition.id}`}
                      className="text-purple-400 hover:text-purple-300 text-sm"
                    >
                      Ver detalles →
                    </Link>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
} 