'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const competitionSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  date: z.string().refine((date) => new Date(date) > new Date(), {
    message: 'La fecha debe ser posterior a hoy',
  }),
  location: z.string().min(3, 'La ubicación debe tener al menos 3 caracteres'),
  maxParticipants: z.number().min(2, 'Debe haber al menos 2 participantes').max(64, 'Máximo 64 participantes'),
});

type CompetitionForm = z.infer<typeof competitionSchema>;

export default function NewCompetition() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompetitionForm>({
    resolver: zodResolver(competitionSchema),
  });

  const onSubmit = async (data: CompetitionForm) => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Error al crear la competencia');
      }

      toast.success('¡Competencia creada con éxito!');
      router.push('/dashboard/competitions');
    } catch (error) {
      toast.error('Error al crear la competencia');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Crear Nueva Competencia
        </h1>
        <p className="mt-1 text-sm text-gray-300">
          Completa el formulario para crear una nueva competencia.
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              Título
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                {...register('title')}
                className="block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                placeholder="Ej: Batalla de los Gallos Regional"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-300"
            >
              Descripción
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                rows={4}
                {...register('description')}
                className="block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                placeholder="Describe los detalles de la competencia..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-300"
            >
              Fecha
            </label>
            <div className="mt-1">
              <input
                type="datetime-local"
                id="date"
                {...register('date')}
                className="block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-300"
            >
              Ubicación
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="location"
                {...register('location')}
                className="block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                placeholder="Ej: Madrid, España"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="maxParticipants"
              className="block text-sm font-medium text-gray-300"
            >
              Número Máximo de Participantes
            </label>
            <div className="mt-1">
              <input
                type="number"
                id="maxParticipants"
                {...register('maxParticipants', { valueAsNumber: true })}
                className="block w-full rounded-md border-gray-700 bg-gray-700 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                min={2}
                max={64}
              />
              {errors.maxParticipants && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.maxParticipants.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-4 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Crear Competencia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 