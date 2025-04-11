'use client';

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  // Si está cargando, mostramos un estado de carga
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, mostramos la página de inicio normal
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4">
            Rimappa
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Conectando organizadores y competidores de freestyle rap
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Registrarse
            </Link>
            <Link
              href="/login"
              className="bg-transparent border-2 border-purple-600 hover:bg-purple-600/10 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            title="Organiza Competencias"
            description="Crea y gestiona tus propias competencias de freestyle con total control."
            icon="🎤"
          />
          <FeatureCard
            title="Participa"
            description="Encuentra las mejores competencias y demuestra tu talento."
            icon="🏆"
          />
          <FeatureCard
            title="Construye tu Reputación"
            description="Gana reconocimiento en la comunidad del freestyle."
            icon="⭐"
          />
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ title, description, icon }: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="bg-gray-800/50 p-6 rounded-lg hover:bg-gray-800/70 transition-colors">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
} 