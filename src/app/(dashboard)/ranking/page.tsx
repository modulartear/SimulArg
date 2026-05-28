'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFormatCurrency, useUsuarioEquipo } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { getRankingCompetencia, getEquipo } from '@/lib/db'
import type { ResultadoPeriodo, Equipo } from '@/types'

export default function RankingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const formatCurrency = useFormatCurrency()
  const { equipo, loading: equipoLoading } = useUsuarioEquipo(user?.uid || '')

  const [ranking, setRanking] = useState<ResultadoPeriodo[]>([])
  const [equiposData, setEquiposData] = useState<Map<string, Equipo>>(new Map())
  const [loadingRanking, setLoadingRanking] = useState(true)

  useEffect(() => {
    const loadRanking = async () => {
      if (!equipo) return
      setLoadingRanking(true)
      try {
        const results = await getRankingCompetencia(equipo.competencia_id)
        setRanking(results)

        // Cargar datos de equipos
        const equipoMap = new Map<string, Equipo>()
        for (const result of results) {
          const equipoData = await getEquipo(result.equipo_id)
          if (equipoData) {
            equipoMap.set(result.equipo_id, equipoData)
          }
        }
        setEquiposData(equipoMap)
      } catch (err) {
        console.error('Error cargando ranking:', err)
      } finally {
        setLoadingRanking(false)
      }
    }

    loadRanking()
  }, [equipo])

  if (loading || equipoLoading) return <div className="text-white text-center pt-20">Cargando...</div>
  if (!user) {
    router.replace('/login')
    return null
  }

  if (user.rol === 'teacher' || user.rol === 'admin') {
    router.replace('/competencias')
    return null
  }

  if (!equipo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No hay equipo asignado</h2>
          <p className="text-gray-600">Tu profesor aún no te ha asignado a un equipo.</p>
        </div>
      </div>
    )
  }

  const currentTeamResult = ranking.find((r) => r.equipo_id === equipo.id)
  const currentPosition = currentTeamResult ? ranking.findIndex((r) => r.equipo_id === equipo.id) + 1 : null

  const getMedalEmoji = (position: number) => {
    if (position === 1) return '🥇'
    if (position === 2) return '🥈'
    if (position === 3) return '🥉'
    return position.toString()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        <Link href="/dashboard" className="text-purple-200 hover:text-white mb-6 inline-block">
          ← Volver al Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏆 Ranking de Equipos - Período {ranking.length > 0 ? ranking[0].periodo : '1'}/8
          </h1>
          <p className="text-gray-600 mb-6">
            {loadingRanking ? 'Cargando...' : `Competencia en vivo | ${ranking.length} equipos`}
          </p>

          {loadingRanking ? (
            <p className="text-gray-600 text-center py-8">Cargando ranking...</p>
          ) : ranking.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Aún no hay resultados procesados</p>
          ) : (
            <>
              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <th className="px-4 py-3 text-left font-semibold">POS</th>
                      <th className="px-4 py-3 text-left font-semibold">EQUIPO</th>
                      <th className="px-4 py-3 text-right font-semibold">GANANCIA ACUM.</th>
                      <th className="px-4 py-3 text-right font-semibold">PERÍODO</th>
                      <th className="px-4 py-3 text-right font-semibold">MARGEN</th>
                      <th className="px-4 py-3 text-right font-semibold">EFECTIVO</th>
                      <th className="px-4 py-3 text-center font-semibold">ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ranking.map((result, idx) => {
                      const equipoName = equiposData.get(result.equipo_id)?.nombre || 'Equipo Desconocido'
                      const isCurrentTeam = result.equipo_id === equipo.id
                      return (
                        <tr
                          key={result.equipo_id}
                          className={`border-b transition hover:bg-gray-50 ${
                            isCurrentTeam ? 'bg-blue-50 font-semibold' : idx % 2 === 0 ? 'bg-gray-50' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <span className="text-lg">{getMedalEmoji(idx + 1)}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-900">{equipoName}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-green-600 font-bold">
                              {formatCurrency(result.ganancia_acumulada)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">{formatCurrency(result.ganancia_neta)}</td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={result.margen_neto > 22 ? 'text-green-600 font-semibold' : 'text-gray-700'}
                            >
                              {result.margen_neto.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-blue-600 font-semibold">
                            {formatCurrency(result.efectivo)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                result.estado === 'ACTIVA'
                                  ? 'bg-green-100 text-green-800'
                                  : result.estado === 'CRITICA'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {result.estado}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Información adicional */}
              {currentTeamResult && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600">Tu Equipo: {equipo.nombre}</p>
                    <p className="text-2xl font-bold text-blue-600">Posición {currentPosition}/{ranking.length}</p>
                    {currentPosition !== 1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(ranking[0].ganancia_acumulada - currentTeamResult.ganancia_acumulada)} detrás del
                        líder
                      </p>
                    )}
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-gray-600">Mercado Total</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(ranking.reduce((sum, r) => sum + r.ganancia_acumulada, 0))}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Ganancia combinada de todos</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="text-sm text-gray-600">Margen Promedio</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(ranking.reduce((sum, r) => sum + r.margen_neto, 0) / ranking.length).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tu margen: {currentTeamResult.margen_neto.toFixed(1)}%
                    </p>
                  </div>
                </div>
              )}

              {/* Análisis */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Análisis Competitivo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Líder del Ranking</p>
                    <p className="text-lg font-bold text-gray-900">
                      {ranking.length > 0 ? equiposData.get(ranking[0].equipo_id)?.nombre : 'N/A'}
                    </p>
                    {ranking.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Ganancia: {formatCurrency(ranking[0].ganancia_acumulada)}
                      </p>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Margen Más Alto</p>
                    {ranking.length > 0 && (
                      <>
                        <p className="text-lg font-bold text-gray-900">
                          {(
                            ranking.reduce((max, r) => (r.margen_neto > max.margen_neto ? r : max))
                              .margen_neto
                          ).toFixed(1)}%
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Equipo:{' '}
                          {equiposData.get(
                            ranking.reduce((max, r) => (r.margen_neto > max.margen_neto ? r : max)).equipo_id
                          )?.nombre || 'N/A'}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
