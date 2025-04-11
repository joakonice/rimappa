'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrophyIcon, UserGroupIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'COMPETITION_CREATED' | 'PARTICIPATION_REQUESTED' | 'PARTICIPATION_UPDATED';
  title: string;
  description: string;
  createdAt: Date;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-lg font-medium text-white mb-4">Actividad Reciente</h2>
        <p className="text-gray-400 text-sm">No hay actividad reciente</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-medium text-white mb-4">Actividad Reciente</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                {activity.type === 'COMPETITION_CREATED' && (
                  <TrophyIcon className="h-4 w-4 text-white" />
                )}
                {activity.type === 'PARTICIPATION_REQUESTED' && (
                  <UserGroupIcon className="h-4 w-4 text-white" />
                )}
                {activity.type === 'PARTICIPATION_UPDATED' && (
                  <CheckCircleIcon className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{activity.title}</p>
              <p className="text-sm text-gray-400">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {format(activity.createdAt, "d 'de' MMMM 'a las' HH:mm", { locale: es })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 