'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getCompetencias, getEquiposCompetencia } from '@/lib/db'
import { useFormatCurrency } from '@/lib/hooks'
import type { Competencia, Equipo } from '@/types'

export default function CompetenciasPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const formatCurrency = useFormatCurrency()

  const [competencias, setCompetencias] = useState<Competencia[]>([])
  const [loadingCompetencias, setLoadingCompetencias] = useState(true)
  const [selectedCompetencia, setSelectedCompetencia] = useState<string | null>(null)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loadingEquipos, setLoadingEquipos] = useState(false)
  const [processingPeriodo, setProcessingPeriodo] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const loadCompetencias = async () => {
      if (!user) return
      try {
        const data = await getCompetencias(user.uid)
        setCompetencias(data)
      } catch (err) {
        console.error('Error cargando competencias:', err)
      } finally {
        setLoadingCompetencias(false)
      }
    }

    if (user) loadCompetencias()
  }, [user])

  useEffect(() => {
    const loadEquipos = async () => {
      if (!selectedCompetencia) {
        setEquipos([])
        return
      }

      setLoadingEquipos(true)
      try {
        const data = await getEquiposCompetencia(selectedCompetencia)
        setEquipos(data)
      } catch (err) {
        console.error('Error cargando equipos:', err)
      } finally {
        setLoadingEquipos(false)
      }
    }

    loadEquipos()
  }, [selectedCompetencia])

  console.log('User:', user)
  console.log('Rol:', user?.rol)

  if (loading || loadingCompetencias) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    )
  }

  if (!user || user.rol !== 'teacher') {
    console.log('Redirigiendo a dashboard porque no es teacher')
    router.push('/dashboard')
    return null
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const handleProcessPeriodo = async () => {
    if (!selectedCompetencia) {
      setMessage({ type: 'error', text: 'Selecciona una competencia primero' })
      return
    }

    const competencia = competencias.find((c) => c.id === selectedCompetencia)
    if (!competencia) return

    setProcessingPeriodo(true)
    try {
      const response = await fetch('/api/procesar-periodo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competenciaId: selectedCompetencia,
          periodo: competencia.periodo_actual,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar período')
      }

      setMessage({
        type: 'success',
        text: `✓ Período ${competencia.periodo_actual} procesado exitosamente. ${data.equiposProcesados} equipos evaluados.`,
      })

      // Recargar competencias
      const updated = await getCompetencias(user.uid)
      setCompetencias(updated)

      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al procesar período',
      })
    } finally {
      setProcessingPeriodo(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 pt-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Panel del Profesor</h1>
            <p className="text-blue-100 mt-1">Bienvenido, {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            Salir
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Competencias */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Lista de competencias */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Mis Competencias</h2>

            {competencias.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No tienes competencias creadas</p>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
                  + Crear Competencia
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {competencias.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedCompetencia(comp.id)}
                    className={`w-full text-left p-4 rounded-lg transition ${
                      selectedCompetencia === comp.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <p className="font-semibold">{comp.nombre}</p>
                    <p className={`text-sm ${selectedCompetencia === comp.id ? 'text-blue-100' : 'text-gray-600'}`}>
                      Período {comp.periodo_actual}/{comp.total_periodos}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalles y Equipos */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCompetencia ? (
              <>
                {/* Detalles de la competencia */}
                {competencias.find((c) => c.id === selectedCompetencia) && (
                  <div className="bg-white rounded-lg shadow-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {competencias.find((c) => c.id === selectedCompetencia)?.nombre}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {competencias.find((c) => c.id === selectedCompetencia)?.descripcion}
                        </p>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-full font-semibold text-sm ${
                          competencias.find((c) => c.id === selectedCompetencia)?.estado === 'en_curso'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {competencias.find((c) => c.id === selectedCompetencia)?.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-gray-600 text-sm">Período Actual</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {competencias.find((c) => c.id === selectedCompetencia)?.periodo_actual}/
                          {competencias.find((c) => c.id === selectedCompetencia)?.total_periodos}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm">Equipos</p>
                        <p className="text-2xl font-bold text-purple-600">{equipos.length}</p>
                      </div>
                    </div>

                    {competencias.find((c) => c.id === selectedCompetencia)?.estado === 'en_curso' && (
                      <button
                        onClick={handleProcessPeriodo}
                        disabled={processingPeriodo}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
                      >
                        {processingPeriodo ? '⏳ Procesando período...' : '▶ Procesar Período'}
                      </button>
                    )}
                  </div>
                )}

                {/* Equipos */}
                <div className="bg-white rounded-lg shadow-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Equipos ({equipos.length})</h3>

                  {loadingEquipos ? (
                    <p className="text-gray-600">Cargando equipos...</p>
                  ) : equipos.length === 0 ? (
                    <p className="text-gray-600">No hay equipos en esta competencia</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-100 border-b">
                            <th className="px-4 py-2 text-left font-semibold text-gray-900">Equipo</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-900">Efectivo</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-900">Ganancia Acum.</th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-900">Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {equipos.map((equipo) => (
                            <tr key={equipo.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{equipo.nombre}</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(equipo.efectivo)}</td>
                              <td className="px-4 py-3 text-right font-semibold text-green-600">
                                {formatCurrency(equipo.ganancia_acumulada)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    equipo.estado === 'activa'
                                      ? 'bg-green-100 text-green-800'
                                      : equipo.estado === 'critica'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {equipo.estado}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-xl p-12 text-center">
                <p className="text-gray-600 text-lg">Selecciona una competencia para ver detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
