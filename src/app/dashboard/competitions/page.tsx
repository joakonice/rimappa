'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Map, { Marker, NavigationControl, Popup } from '@vis.gl/react-maplibre';
import { CalendarIcon, MapPinIcon, UserGroupIcon, AdjustmentsHorizontalIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import 'maplibre-gl/dist/maplibre-gl.css';
import { prisma } from '@/lib/prisma';

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
  modality: string;
  price: string;
  rating: string;
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
    modality: 'Freestyle',
    price: 'Free',
    rating: '5'
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
    modality: 'El Quinto Escalón',
    price: 'Weekend',
    rating: '4'
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
    modality: 'Underground Battles',
    price: 'Free',
    rating: '3'
  }
];

export default function CompetitionsPage() {
  const { data: session } = useSession();
  const isOrganizer = session?.user?.role === 'ORGANIZER';
  const [competitions, setCompetitions] = useState<Competition[]>(mockCompetitions);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  
  // Estados para filtros
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'microphone' | 'beatbox'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'popularity' | 'date' | 'name'>('date');
  const [searchRadius, setSearchRadius] = useState(5000); // metros
  const [searchQuery, setSearchQuery] = useState('');

  const [viewport, setViewport] = useState({
    latitude: -34.6037,
    longitude: -58.3815,
    zoom: 12
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const response = await fetch('/api/competitions');
        if (!response.ok) {
          throw new Error('Error al cargar las competencias');
        }
        const data = await response.json();
        setCompetitions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        // Mientras tanto, usar datos mock
        setCompetitions(mockCompetitions);
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // Filtrar competencias basado en los filtros activos
  const filteredCompetitions = competitions.filter(competition => {
    // Filtro por búsqueda
    if (searchQuery && !competition.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const today = new Date();
      const competitionDate = new Date(competition.date);
      
      switch (dateFilter) {
        case 'today':
          if (competitionDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          if (competitionDate > weekFromNow || competitionDate < today) return false;
          break;
        case 'month':
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          if (competitionDate > monthFromNow || competitionDate < today) return false;
          break;
      }
    }

    // Filtro por tipo
    if (typeFilter !== 'all' && competition.modality.toLowerCase() !== typeFilter) {
      return false;
    }

    // Por ahora ignoramos el radio de búsqueda ya que necesitaríamos la ubicación del usuario
    return true;
  }).sort((a, b) => {
    // Ordenar según criterio seleccionado
    switch (sortBy) {
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'popularity':
        return b.currentParticipants - a.currentParticipants;
      case 'distance':
        // Por ahora, si es por distancia, ordenamos por fecha como fallback
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      default:
        return 0;
    }
  });

  // Agregar console.log para debugging
  useEffect(() => {
    console.log('Competitions:', competitions);
    console.log('Filtered Competitions:', filteredCompetitions);
    console.log('Current filters:', { dateFilter, typeFilter, sortBy, searchRadius, searchQuery });
  }, [competitions, filteredCompetitions, dateFilter, typeFilter, sortBy, searchRadius, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Competencias</h1>
        {isOrganizer && (
          <Link
            href="/dashboard/competitions/new"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Crear Competencia
          </Link>
        )}
      </div>

      <div className="h-[calc(100vh-4rem)]">
        <div className="flex h-full">
          {/* Panel lateral */}
          <div className="w-96 bg-gray-800 p-4 overflow-y-auto relative">
            {/* Header con búsqueda */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">Rimappa</h1>
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
              <div>
                <label className="text-sm text-gray-400 block mb-2">Fecha</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'Todas' },
                    { value: 'today', label: 'Hoy' },
                    { value: 'week', label: 'Esta semana' },
                    { value: 'month', label: 'Este mes' }
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setDateFilter(filter.value as any)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        dateFilter === filter.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Tipo</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'Todos' },
                    { value: 'microphone', label: 'Micrófono' },
                    { value: 'beatbox', label: 'BeatBox' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setTypeFilter(type.value as any)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        typeFilter === type.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
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
                      zoom: 14
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
                      {format(new Date(competition.date), "d MMM", { locale: es })}
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
          <div className="flex-1 relative">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-white">Cargando mapa...</div>
            </div>}>
              <Map
                longitude={viewport.longitude}
                latitude={viewport.latitude}
                zoom={viewport.zoom}
                style={{ width: '100%', height: '100%' }}
                mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
                dragRotate={false}
                onMove={evt => setViewport(evt.viewState)}
                onClick={evt => {
                  // Cerrar el popup si se hace click en el mapa
                  setSelectedCompetition(null);
                }}
              >
                <NavigationControl />
                {filteredCompetitions.map((competition) => (
                  <Marker
                    key={competition.id}
                    longitude={competition.coordinates[0]}
                    latitude={competition.coordinates[1]}
                    onClick={e => {
                      e.originalEvent.stopPropagation();
                      setSelectedCompetition(competition);
                    }}
                  >
                    <div className="cursor-pointer">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs">
                        {competition.currentParticipants}
                      </div>
                    </div>
                  </Marker>
                ))}
                {selectedCompetition && (
                  <Popup
                    longitude={selectedCompetition.coordinates[0]}
                    latitude={selectedCompetition.coordinates[1]}
                    closeButton={true}
                    closeOnClick={false}
                    onClose={() => setSelectedCompetition(null)}
                    anchor="bottom"
                  >
                    <div className="p-2">
                      <h3 className="font-bold">{selectedCompetition.title}</h3>
                      <p>{selectedCompetition.description}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(selectedCompetition.date), 'PPP', { locale: es })}
                      </p>
                    </div>
                  </Popup>
                )}
              </Map>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 