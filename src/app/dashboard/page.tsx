import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DashboardStats from '@/components/DashboardStats';
import RecentActivity from '@/components/RecentActivity';
import { redirect } from 'next/navigation';
import CompetitionCard from '@/components/CompetitionCard';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  console.log('Dashboard - Session:', session);

  if (!session?.user) {
    console.log('Dashboard - No session found, redirecting to login');
    redirect('/login');
  }

  const isOrganizer = session.user.role === 'ORGANIZER';

  // Obtener estadísticas según el rol
  let stats;
  if (isOrganizer) {
    const [activeCompetitions, totalParticipants, upcomingCompetitions] = await Promise.all([
      prisma.competition.count({
        where: {
          organizerId: session.user.id,
          status: 'OPEN',
        },
      }),
      prisma.participation.count({
        where: {
          competition: {
            organizerId: session.user.id,
          },
        },
      }),
      prisma.competition.count({
        where: {
          organizerId: session.user.id,
          date: {
            gt: new Date(),
          },
        },
      }),
    ]);

    stats = {
      activeCompetitions,
      participants: totalParticipants,
      upcomingCompetitions,
    };
  } else {
    const [activeParticipations, totalParticipations, upcomingCompetitions] = await Promise.all([
      prisma.participation.count({
        where: {
          userId: session.user.id,
          status: 'ACCEPTED',
          competition: {
            status: 'OPEN',
          },
        },
      }),
      prisma.participation.count({
        where: {
          userId: session.user.id,
        },
      }),
      prisma.competition.count({
        where: {
          date: {
            gt: new Date(),
          },
          participants: {
            some: {
              userId: session.user.id,
              status: 'ACCEPTED',
            },
          },
        },
      }),
    ]);

    stats = {
      activeCompetitions: activeParticipations,
      participants: totalParticipations,
      upcomingCompetitions,
    };
  }

  // Obtener actividad reciente
  const recentActivities = await prisma.activity.findMany({
    where: isOrganizer
      ? {
          OR: [
            { type: 'COMPETITION_CREATED', userId: session.user.id },
            {
              type: 'PARTICIPATION_REQUESTED',
              competition: { organizerId: session.user.id },
            },
            {
              type: 'PARTICIPATION_UPDATED',
              competition: { organizerId: session.user.id },
            },
          ],
        }
      : {
          OR: [
            { userId: session.user.id },
            {
              competition: {
                participants: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            },
          ],
        },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  // Datos de ejemplo basados en la competencia de freestyle
  const competitions = [
    {
      id: '1',
      title: 'DINASTIA FREESTYLE',
      description: 'DOS VS DOS - Fecha #4 del Torneo 10',
      image: '/images/competitions/dinastia-freestyle.jpg',
      date: '2024-05-01', // Jueves 1 de Mayo
      location: 'Plaza San Martin, Morón',
      maxParticipants: 32,
      currentParticipants: 0,
      status: 'OPEN',
      organizer: {
        id: '1',
        name: 'Torneo 10'
      },
      participants: [],
      rating: 4.8,
      price: '2.500',
      details: {
        schedule: [
          { time: '17:00 a 18:00', price: '2.500$ x Team' },
          { time: '18:00 a 18:45', price: '3.000$ x Team' }
        ],
        prize: '80.000$ + SPONSORT',
        judges: ['KIRO', 'DOSSANTOS', 'CLAP'],
        hosts: ['NICOLAAS KTRES', 'NERY LUIAN'],
        extras: {
          filmmaker: 'GABILONG 7',
          music: 'OMNI WEST SIDE',
          photography: 'UCZCLAIM'
        }
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Bienvenido, {session.user.name}
        </h1>
        <p className="mt-1 text-sm text-gray-300">
          Este es tu panel de control donde puedes gestionar tus {isOrganizer ? 'competencias' : 'participaciones'}.
        </p>
      </div>

      <DashboardStats stats={stats} isOrganizer={isOrganizer} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-white mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            {isOrganizer ? (
              <Link
                href="/dashboard/competitions/new"
                className="block w-full text-left px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Crear Nueva Competencia
              </Link>
            ) : (
              <Link
                href="/dashboard/competitions"
                className="block w-full text-left px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Buscar Competencias
              </Link>
            )}
            <Link
              href="/dashboard/profile"
              className="block w-full text-left px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Actualizar Perfil
            </Link>
          </div>
        </div>

        <RecentActivity activities={recentActivities} />
      </div>

      <div className="p-4 space-y-6">
        {/* Today's Competitions */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Competencias de hoy</h2>
            <button className="text-purple-400 text-sm">Ver todas</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {competitions.slice(0, 1).map((competition) => (
              <CompetitionCard 
                key={competition.id} 
                competition={competition}
              />
            ))}
          </div>
        </section>

        {/* This Week's Competitions */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Esta semana</h2>
            <button className="text-purple-400 text-sm">Ver todas</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {competitions.slice(1).map((competition) => (
              <CompetitionCard 
                key={competition.id} 
                competition={competition}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
} 