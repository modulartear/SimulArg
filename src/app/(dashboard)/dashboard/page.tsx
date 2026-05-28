'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'
import KPICard from '@/components/ui/KPICard'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useFormatCurrency, useUsuarioEquipo, useResultadosEquipo } from '@/lib/hooks'
import type { ResultadoPeriodo } from '@/types'

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const formatCurrency = useFormatCurrency()

  const { equipo, loading: equipoLoading } = useUsuarioEquipo(user?.uid || '')
  const { resultados, loading: resultadosLoading } = useResultadosEquipo(
    equipo?.id || '',
    equipo?.competencia_id || ''
  )

  // Obtener resultado más reciente
  const ultimoResultado = resultados.length > 0 ? resultados[resultados.length - 1] : null

  // Preparar datos para el gráfico
  const chartData = resultados.map((r: ResultadoPeriodo) => ({
    periodo: r.periodo,
    ingresos: r.ingresos,
    costos: r.costos_fijos + r.costos_variables,
  }))

  if (loading || equipoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (!equipo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay equipo asignado</h2>
          <p className="text-gray-600">
            Tu profesor aún no te ha asignado a un equipo. Por favor, contacta a tu profesor.
          </p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  // Calcular cambio comparando con período anterior
  const cambioGanancia =
    resultados.length > 1
      ? ultimoResultado && resultados[resultados.length - 2]
        ? ((ultimoResultado.ganancia_neta - resultados[resultados.length - 2].ganancia_neta) /
            resultados[resultados.length - 2].ganancia_neta) *
          100
        : 0
      : 0

  const cambioEfectivo =
    resultados.length > 1
      ? ultimoResultado && resultados[resultados.length - 2]
        ? ((ultimoResultado.efectivo - resultados[resultados.length - 2].efectivo) /
            resultados[resultados.length - 2].efectivo) *
          100
        : 0
      : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Dashboard</h1>
            <p className="text-purple-100 mt-1">Equipo: {equipo.nombre}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            title="Ganancia Acumulada"
            value={formatCurrency(ultimoResultado?.ganancia_acumulada || 0)}
            icon="💰"
            change={ultimoResultado?.ganancia_neta || 0}
            trend={ultimoResultado && ultimoResultado.ganancia_neta > 0 ? 'up' : 'down'}
            color="success"
          />
          <KPICard
            title="Ganancia Período"
            value={formatCurrency(ultimoResultado?.ganancia_neta || 0)}
            icon="📈"
            change={cambioGanancia}
            trend={cambioGanancia > 0 ? 'up' : 'down'}
            color="primary"
          />
          <KPICard
            title="Efectivo Disponible"
            value={formatCurrency(ultimoResultado?.efectivo || 0)}
            icon="💵"
            change={cambioEfectivo}
            trend={cambioEfectivo > 0 ? 'up' : 'down'}
            color="warning"
          />
          <KPICard
            title="Margen Neto"
            value={ultimoResultado ? `${ultimoResultado.margen_neto.toFixed(1)}%` : '0%'}
            icon="📊"
            change={ultimoResultado?.margen_neto || 0}
            trend={ultimoResultado && ultimoResultado.margen_neto > 20 ? 'up' : 'down'}
            color="success"
          />
        </div>

        {/* Gráfico */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Evolución de Ingresos vs Costos</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="periodo" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line type="monotone" dataKey="ingresos" stroke="#667eea" strokeWidth={2} name="Ingresos" />
                <Line type="monotone" dataKey="costos" stroke="#f093fb" strokeWidth={2} name="Costos" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No hay datos de períodos para mostrar. Cuando tu profesor procese el primer período verás los datos aquí.</p>
            </div>
          )}
        </div>

        {/* Menu Principal */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: '📊 Decisiones',
              href: '/decisiones',
              color: 'from-blue-500 to-blue-600',
              description: 'Toma decisiones estratégicas',
            },
            {
              title: '📈 Reportes',
              href: '/reportes',
              color: 'from-green-500 to-green-600',
              description: 'Ve reportes financieros',
            },
            {
              title: '🏆 Ranking',
              href: '/ranking',
              color: 'from-yellow-500 to-yellow-600',
              description: 'Compite con otros equipos',
            },
            {
              title: '📰 LA VOZ',
              href: '/la-voz',
              color: 'from-purple-500 to-pink-600',
              description: 'Análisis del mercado',
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`bg-gradient-to-r ${item.color} text-white rounded-lg p-6 shadow-lg hover:shadow-xl transition transform hover:scale-105`}
            >
              <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
              <p className="text-blue-100">{item.description}</p>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-semibold text-gray-900 mb-2">Toma Decisiones</h4>
              <p className="text-gray-600">
                Completa el formulario de decisiones para tu equipo cada período
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-semibold text-gray-900 mb-2">Ve Resultados</h4>
              <p className="text-gray-600">
                Observa cómo tus decisiones impactan en los resultados financieros
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-semibold text-gray-900 mb-2">Analiza y Compite</h4>
              <p className="text-gray-600">
                Compara con otros equipos y ajusta tu estrategia
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
