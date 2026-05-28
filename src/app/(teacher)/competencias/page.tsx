'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getCompetencias, getEquiposCompetencia, crearCompetencia, crearEquipo, getUsuarios, actualizarEquipo } from '@/lib/db'
import { useFormatCurrency } from '@/lib/hooks'
import type { Usuario } from '@/types'
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
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    nombre: '',
    descripcion: '',
    total_periodos: 12,
    capital_inicial: 100000,
  })
  const [creatingCompetencia, setCreatingCompetencia] = useState(false)
  const [showCreateTeamForm, setShowCreateTeamForm] = useState(false)
  const [createTeamFormData, setCreateTeamFormData] = useState({
    nombre: '',
  })
  const [creatingTeam, setCreatingTeam] = useState(false)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState<string | null>(null)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)

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
    const loadUsuarios = async () => {
      try {
        const data = await getUsuarios()
        setUsuarios(data)
      } catch (err) {
        console.error('Error cargando usuarios:', err)
      } finally {
        setLoadingUsuarios(false)
      }
    }

    loadUsuarios()
  }, [])

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

  const handleCreateCompetencia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setCreatingCompetencia(true)
    try {
      // Fecha de inicio es hoy, fecha de fin es hoy + (número de períodos * 7 días)
      const fechaInicio = new Date()
      const fechaFin = new Date()
      fechaFin.setDate(fechaFin.getDate() + createFormData.total_periodos * 7)

      const nuevaCompetencia = {
        nombre: createFormData.nombre,
        descripcion: createFormData.descripcion,
        profesor_id: user.uid,
        estado: 'preparacion' as const,
        periodo_actual: 1,
        total_periodos: createFormData.total_periodos,
        capital_inicial: createFormData.capital_inicial,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        equipos: [],
      }

      const competenciaId = await crearCompetencia(nuevaCompetencia)
      
      // Recargar la lista de competencias
      const data = await getCompetencias(user.uid)
      setCompetencias(data)

      setShowCreateForm(false)
      setCreateFormData({
        nombre: '',
        descripcion: '',
        total_periodos: 12,
        capital_inicial: 100000,
      })
      setMessage({ type: 'success', text: '¡Competencia creada exitosamente!' })
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      console.error('Error creando competencia:', err)
      setMessage({ type: 'error', text: 'Error al crear la competencia' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setCreatingCompetencia(false)
    }
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedCompetencia) return

    const competencia = competencias.find((c) => c.id === selectedCompetencia)
    if (!competencia) return

    setCreatingTeam(true)
    try {
      const nuevoEquipo = {
        nombre: createTeamFormData.nombre,
        competencia_id: selectedCompetencia,
        profesor_id: user.uid,
        miembros: [],
        efectivo: competencia.capital_inicial,
        inventario: 0,
        deuda: 0,
        estado: 'activa' as const,
        posicion_ranking: 0,
        ganancia_acumulada: 0,
        periodo_actual: 1,
      }

      await crearEquipo(nuevoEquipo)
      
      // Recargar la lista de equipos
      const equiposData = await getEquiposCompetencia(selectedCompetencia)
      setEquipos(equiposData)

      setShowCreateTeamForm(false)
      setCreateTeamFormData({
        nombre: '',
      })
      setMessage({ type: 'success', text: '¡Equipo creado exitosamente!' })
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      console.error('Error creando equipo:', err)
      setMessage({ type: 'error', text: 'Error al crear el equipo' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setCreatingTeam(false)
    }
  }

  const handleAddMember = async (usuarioId: string) => {
    if (!selectedTeamForMembers) return

    const equipo = equipos.find((e) => e.id === selectedTeamForMembers)
    if (!equipo) return

    try {
      await actualizarEquipo(selectedTeamForMembers, {
        miembros: [...(equipo.miembros || []), usuarioId],
      })

      // Recargar la lista de equipos
      const equiposData = await getEquiposCompetencia(selectedCompetencia!)
      setEquipos(equiposData)

      setShowAddMemberModal(false)
      setSelectedTeamForMembers(null)
      setMessage({ type: 'success', text: '¡Miembro agregado exitosamente!' })
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      console.error('Error agregando miembro:', err)
      setMessage({ type: 'error', text: 'Error al agregar el miembro' })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const handleRemoveMember = async (usuarioId: string) => {
    if (!selectedTeamForMembers) return

    const equipo = equipos.find((e) => e.id === selectedTeamForMembers)
    if (!equipo) return

    try {
      await actualizarEquipo(selectedTeamForMembers, {
        miembros: (equipo.miembros || []).filter((id) => id !== usuarioId),
      })

      // Recargar la lista de equipos
      const equiposData = await getEquiposCompetencia(selectedCompetencia!)
      setEquipos(equiposData)

      setMessage({ type: 'success', text: '¡Miembro eliminado exitosamente!' })
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      console.error('Error eliminando miembro:', err)
      setMessage({ type: 'error', text: 'Error al eliminar el miembro' })
      setTimeout(() => setMessage(null), 5000)
    }
  }

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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Mis Competencias</h2>
              {!showCreateForm && competencias.length > 0 && (
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                >
                  + Nueva
                </button>
              )}
            </div>

            {competencias.length === 0 && !showCreateForm ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No tienes competencias creadas</p>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white px-6 py-2 rounded-lg transition font-semibold"
            >
              + Crear Competencia
            </button>
          </div>
        ) : showCreateForm ? (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Nueva Competencia</h3>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCompetencia} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Competencia</label>
                <input
                  type="text"
                  required
                  value={createFormData.nombre}
                  onChange={(e) => setCreateFormData({...createFormData, nombre: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Simulación Empresarial 2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={createFormData.descripcion}
                  onChange={(e) => setCreateFormData({...createFormData, descripcion: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción de la competencia..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total de Períodos</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={createFormData.total_periodos}
                    onChange={(e) => setCreateFormData({...createFormData, total_periodos: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capital Inicial ($)</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={createFormData.capital_inicial}
                    onChange={(e) => setCreateFormData({...createFormData, capital_inicial: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingCompetencia}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition font-semibold"
                >
                  {creatingCompetencia ? 'Creando...' : 'Crear Competencia'}
                </button>
              </div>
            </form>
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Equipos ({equipos.length})</h3>
                    {!showCreateTeamForm && (
                      <button 
                        onClick={() => setShowCreateTeamForm(true)}
                        className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                      >
                        + Nuevo Equipo
                      </button>
                    )}
                  </div>

                  {showCreateTeamForm ? (
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-900">Nuevo Equipo</h4>
                        <button 
                          onClick={() => setShowCreateTeamForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      <form onSubmit={handleCreateTeam} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Equipo</label>
                          <input
                            type="text"
                            required
                            value={createTeamFormData.nombre}
                            onChange={(e) => setCreateTeamFormData({...createTeamFormData, nombre: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Los Emprendedores"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setShowCreateTeamForm(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            disabled={creatingTeam}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition font-semibold"
                          >
                            {creatingTeam ? 'Creando...' : 'Crear Equipo'}
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : null}

                  {loadingEquipos ? (
                    <p className="text-gray-600">Cargando equipos...</p>
                  ) : equipos.length === 0 ? (
                    <p className="text-gray-600">No hay equipos en esta competencia</p>
                  ) : (
                    <div className="space-y-4">
                      {equipos.map((equipo) => (
                        <div key={equipo.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{equipo.nombre}</h4>
                              <div className="text-sm text-gray-600">
                                <span>{formatCurrency(equipo.efectivo)} • {equipo.estado}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedTeamForMembers(equipo.id)
                                setShowAddMemberModal(true)
                              }}
                              className="text-blue-500 hover:text-blue-700 text-sm font-semibold"
                            >
                              Gestionar Miembros
                            </button>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Miembros ({equipo.miembros?.length || 0}:</span>
                            <div className="mt-2 space-y-1">
                              {equipo.miembros && equipo.miembros.map((miembroId) => {
                                const usuario = usuarios.find((u) => u.uid === miembroId)
                                return (
                                  <div key={miembroId} className="flex justify-between items-center bg-white p-2 rounded">
                                    <span>{usuario?.nombre || usuario?.email || miembroId}</span>
                                    <button
                                      onClick={() => {
                                        setSelectedTeamForMembers(equipo.id)
                                        handleRemoveMember(miembroId)
                                      }}
                                      className="text-red-500 hover:text-red-700 text-xs"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                )
                              })}
                              {(!equipo.miembros || equipo.miembros.length === 0) && (
                                <span className="text-gray-400 italic">No hay miembros en este equipo</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
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

      {/* Modal para agregar miembros */}
      {showAddMemberModal && selectedTeamForMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Agregar Miembro</h3>
              <button
                onClick={() => {
                  setShowAddMemberModal(false)
                  setSelectedTeamForMembers(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {loadingUsuarios ? (
              <p className="text-gray-600">Cargando usuarios...</p>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-2">
                {usuarios
                  .filter((u) => u.rol === 'student')
                  .map((usuario) => {
                    const equipo = equipos.find((e) => e.id === selectedTeamForMembers)
                    const isMember = equipo?.miembros?.includes(usuario.uid)
                    return (
                      <div key={usuario.uid} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">{usuario.nombre || usuario.email}</p>
                          <p className="text-sm text-gray-600">{usuario.email}</p>
                        </div>
                        {isMember ? (
                          <span className="text-green-600 text-sm font-semibold">Agregado</span>
                        ) : (
                          <button
                            onClick={() => handleAddMember(usuario.uid)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-semibold"
                          >
                            Agregar
                          </button>
                        )}
                      </div>
                    )
                  })}
                {usuarios.filter((u) => u.rol === 'student').length === 0 && (
                  <p className="text-gray-600 text-center py-8">No hay estudiantes registrados</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}