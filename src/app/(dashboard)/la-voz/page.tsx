'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFormatCurrency, useUsuarioEquipo } from '@/lib/hooks'
import { getLaVoz } from '@/lib/db'
import { useEffect, useState } from 'react'
import type { LaVoz } from '@/types'

export default function LaVozPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const formatCurrency = useFormatCurrency()
  const { equipo, loading: equipoLoading } = useUsuarioEquipo(user?.uid || '')

  const [laVoz, setLaVoz] = useState<LaVoz | null>(null)
  const [selectedPeriodo, setSelectedPeriodo] = useState(1)
  const [loadingLaVoz, setLoadingLaVoz] = useState(false)

  useEffect(() => {
    const loadLaVoz = async () => {
      if (!equipo) return
      setLoadingLaVoz(true)
      try {
        const data = await getLaVoz(equipo.competencia_id, selectedPeriodo)
        setLaVoz(data)
      } catch (err) {
        console.error('Error cargando LA VOZ:', err)
      } finally {
        setLoadingLaVoz(false)
      }
    }

    loadLaVoz()
  }, [selectedPeriodo, equipo])

  if (loading || equipoLoading) return <div className="min-h-screen app-bg text-white/90 text-center pt-20 font-semibold">Cargando...</div>
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
      <div className="min-h-screen app-bg p-4 flex items-center justify-center">
        <div className="app-surface p-8 text-center max-w-xl w-full">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">No hay equipo asignado</h2>
          <p className="text-slate-600">Tu profesor aún no te ha asignado a un equipo.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen app-bg p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="btn-outline text-white px-4 py-2 rounded-xl transition-smooth hover:bg-white/20 mb-6 inline-block">
          ← Volver al Dashboard
        </Link>

        <div className="app-surface p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">📰 LA VOZ - Análisis del Mercado</h1>
            <p className="text-slate-600">Análisis automático de la situación económica</p>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <label className="text-slate-700 font-semibold">Período:</label>
            <select
              value={selectedPeriodo}
              onChange={(e) => setSelectedPeriodo(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                <option key={p} value={p}>
                  Período {p}
                </option>
              ))}
            </select>
          </div>

          {loadingLaVoz ? (
            <p className="text-slate-600 text-center py-8">Cargando análisis...</p>
          ) : laVoz ? (
            <div className="space-y-8">
              {/* Análisis Económico */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-500">
                <h2 className="text-xl font-bold text-gray-900 mb-3">📊 Análisis Económico</h2>
                <p className="text-gray-700 leading-relaxed">{laVoz.analisis_anterior}</p>
              </div>

              {/* Eventos Ocurridos */}
              {laVoz.eventos_ocurridos && laVoz.eventos_ocurridos.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg border-l-4 border-yellow-500">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">⚡ Eventos Ocurridos</h2>
                  <ul className="space-y-2">
                    {laVoz.eventos_ocurridos.map((evento, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="text-lg">📌</span>
                        <span>{evento}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cambios de Parámetros */}
              {laVoz.cambios_parametros && Object.keys(laVoz.cambios_parametros).length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-500">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">🔄 Cambios en Parámetros</h2>
                  <div className="space-y-3">
                    {Object.entries(laVoz.cambios_parametros).map(([key, value]: [string, any]) => (
                      <div key={key} className="bg-white p-3 rounded border border-purple-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 font-semibold">{value.antes}</span>
                          <span className="text-purple-600 font-bold">→</span>
                          <span className="text-green-600 font-semibold">{value.despues}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Límites del Nuevo Período */}
              {laVoz.limites_nuevo_periodo && Object.keys(laVoz.limites_nuevo_periodo).length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border-l-4 border-green-500">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">📏 Límites para el Próximo Período</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(laVoz.limites_nuevo_periodo).map(([key, value]) => (
                      <div key={key} className="bg-white p-3 rounded border border-green-200">
                        <p className="text-sm font-semibold text-gray-600 capitalize mb-1">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-lg font-bold text-green-600">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Consejos Estratégicos */}
              {laVoz.consejos_estrategicos && laVoz.consejos_estrategicos.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-lg border-l-4 border-indigo-500">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">💡 Consejos Estratégicos</h2>
                  <ul className="space-y-2">
                    {laVoz.consejos_estrategicos.map((consejo, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-gray-700">
                        <span className="text-lg">✨</span>
                        <span>{consejo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ranking Anterior */}
              {laVoz.ranking_anterior && laVoz.ranking_anterior.length > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border-l-4 border-gray-500">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">🏆 Ranking Anterior</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="px-3 py-2 text-left font-semibold">Posición</th>
                          <th className="px-3 py-2 text-left font-semibold">Equipo</th>
                          <th className="px-3 py-2 text-right font-semibold">Ganancia</th>
                          <th className="px-3 py-2 text-right font-semibold">Margen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {laVoz.ranking_anterior.map((item) => (
                          <tr key={item.equipo_id} className="border-b hover:bg-gray-200">
                            <td className="px-3 py-2">
                              {item.posicion === 1 && '🥇'}
                              {item.posicion === 2 && '🥈'}
                              {item.posicion === 3 && '🥉'}
                              {item.posicion > 3 && item.posicion}
                            </td>
                            <td className="px-3 py-2 font-medium">{item.nombre}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.ganancia_acumulada)}</td>
                            <td className="px-3 py-2 text-right">{item.margen_neto.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!laVoz.analisis_anterior && (
                <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 text-center">
                  <p className="text-gray-700">
                    No hay análisis aún para este período. Cuando tu profesor procese el período, LA VOZ será generado
                    automáticamente.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500 text-center">
              <p className="text-gray-700">No hay análisis disponible para este período</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
