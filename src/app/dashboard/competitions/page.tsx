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

  const [filters, setFilters] = useState({
    status: 'all',
    modality: 'all',
    price: 'all',
    rating: 'all'
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
      } finally {
        setLoading(false);
      }
    };

    fetchCompetitions();
  }, []);

  // Obtener valores únicos para los filtros
  const uniqueStatuses = ['all', ...Array.from(new Set(competitions.map(c => c.status)))];
  const uniqueModalities = ['all', ...Array.from(new Set(competitions.map(c => c.modality)))];
  const uniquePrices = ['all', ...Array.from(new Set(competitions.map(c => c.price)))];
  const uniqueRatings = ['all', ...Array.from(new Set(competitions.map(c => c.rating)))];

  const filteredCompetitions = competitions.filter(competition => {
    if (filters.status !== 'all' && competition.status !== filters.status) return false;
    if (filters.modality !== 'all' && competition.modality !== filters.modality) return false;
    if (filters.price !== 'all' && competition.price !== filters.price) return false;
    if (filters.rating !== 'all' && competition.rating !== filters.rating) return false;
    return true;
  });

  const handleMapMove = (evt: any) => {
    setViewport(evt.viewState);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Competencias</h1>
        <button 
          onClick={() => {
            // Implementa la lógica para crear una nueva competencia
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Crear Competencia
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="p-2 border rounded"
        >
          {uniqueStatuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'Todos los estados' : status}
            </option>
          ))}
        </select>

        <select
          value={filters.modality}
          onChange={(e) => setFilters({ ...filters, modality: e.target.value })}
          className="p-2 border rounded"
        >
          {uniqueModalities.map(modality => (
            <option key={modality} value={modality}>
              {modality === 'all' ? 'Todas las modalidades' : modality}
            </option>
          ))}
        </select>

        <select
          value={filters.price}
          onChange={(e) => setFilters({ ...filters, price: e.target.value })}
          className="p-2 border rounded"
        >
          {uniquePrices.map(price => (
            <option key={price} value={price}>
              {price === 'all' ? 'Todos los precios' : price}
            </option>
          ))}
        </select>

        <select
          value={filters.rating}
          onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
          className="p-2 border rounded"
        >
          {uniqueRatings.map(rating => (
            <option key={rating} value={rating}>
              {rating === 'all' ? 'Todas las calificaciones' : rating}
            </option>
          ))}
        </select>
      </div>

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
          <div className="flex-1 relative">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-white">Cargando mapa...</div>
            </div>}>
              <Map
                longitude={-3.7038}
                latitude={40.4168}
                zoom={6}
                style={{ width: '100%', height: '400px' }}
                mapStyle={`https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
              >
                <NavigationControl />
                {filteredCompetitions.map((competition) => {
                  const location = JSON.parse(competition.location);
                  return (
                    <Marker
                      key={competition.id}
                      longitude={location.longitude}
                      latitude={location.latitude}
                    >
                      <Popup
                        longitude={location.longitude}
                        latitude={location.latitude}
                        closeButton={true}
                        closeOnClick={false}
                      >
                        <div className="p-2">
                          <h3 className="font-bold">{competition.title}</h3>
                          <p>{competition.description}</p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(competition.date), 'PPP', { locale: es })}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </Map>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 