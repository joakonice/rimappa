'use client';

import { CalendarIcon, TrophyIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface DashboardStatsProps {
  stats: {
    activeCompetitions: number;
    participants: number;
    upcomingCompetitions: number;
  };
  isOrganizer: boolean;
}

export default function DashboardStats({ stats, isOrganizer }: DashboardStatsProps) {
  const statsConfig = [
    {
      name: 'Competencias Activas',
      value: stats.activeCompetitions,
      icon: TrophyIcon,
      href: '/dashboard/competitions',
    },
    {
      name: isOrganizer ? 'Participantes Totales' : 'Participaciones',
      value: stats.participants,
      icon: UserGroupIcon,
      href: '/dashboard/competitions',
    },
    {
      name: 'Próximas Competencias',
      value: stats.upcomingCompetitions,
      icon: CalendarIcon,
      href: '/dashboard/competitions',
    },
  ];

  return (
    <div className="grid gap-6 mb-8 md:grid-cols-3">
      {statsConfig.map((stat) => (
        <Link
          key={stat.name}
          href={stat.href}
          className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-600 rounded-lg">
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">{stat.name}</p>
              <p className="mt-1 text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 