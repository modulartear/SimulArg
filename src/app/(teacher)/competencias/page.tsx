'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import {
  getCompetencias,
  getEquiposCompetencia,
  crearCompetencia,
  crearEquipo,
  getUsuarios,
  actualizarEquipo,
  actualizarCompetencia,
} from '@/lib/db'
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
  const [startingCompetencia, setStartingCompetencia] = useState(false)
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
    if (selectedCompetencia) return
    if (competencias.length === 0) return
    setSelectedCompetencia(competencias[0].id)
  }, [competencias, selectedCompetencia])

  useEffect(() => {
    const loadUsuarios = async () => {
      try {
        const data = await getUsuarios()
        setUsuarios(data)
      } catch (err) {
        console.error('Error cargando usuarios:', err)
        setMessage({
          type: 'error',
          text: 'No se pudieron cargar los usuarios. Revisá las reglas de Firestore para permitir que el profesor lea la colección "usuarios".',
        })
        setTimeout(() => setMessage(null), 7000)
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

  if (loading || loadingCompetencias) {
    return (
      <div className="min-h-screen app-bg flex items-center justify-center">
        <div className="text-white/90 text-2xl font-semibold">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    router.replace('/login')
    return null
  }

  if (user.rol !== 'teacher' && user.rol !== 'admin') {
    router.replace('/dashboard')
    return null
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const handleStartCompetencia = async () => {
    if (!selectedCompetencia) return
    if (equipos.length === 0) {
      setMessage({ type: 'error', text: 'Crea al menos 1 equipo antes de iniciar la competencia' })
      setTimeout(() => setMessage(null), 5000)
      return
    }

    setStartingCompetencia(true)
    try {
      await actualizarCompetencia(selectedCompetencia, { estado: 'en_curso', periodo_actual: 1 })
      const updated = await getCompetencias(user.uid)
      setCompetencias(updated)
      setMessage({ type: 'success', text: 'Competencia iniciada. Ya puedes procesar el período 1.' })
      setTimeout(() => setMessage(null), 5000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al iniciar la competencia' })
      setTimeout(() => setMessage(null), 5000)
    } finally {
      setStartingCompetencia(false)
    }
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

  const competenciaSeleccionada =
    (selectedCompetencia && competencias.find((c) => c.id === selectedCompetencia)) || competencias[0] || null
  const equiposCount = equipos.length
  const estudiantesUnicos = new Set<string>()
  for (const e of equipos) {
    for (const m of e.miembros || []) estudiantesUnicos.add(m)
  }
  const estudiantesCount = estudiantesUnicos.size
  const rondasTotales = competenciaSeleccionada?.total_periodos ?? 0
  const rondaActual = competenciaSeleccionada?.periodo_actual ?? 0
  const rondasCompletadas = Math.max(0, rondaActual - 1)
  const sumaEfectivo = equipos.reduce((acc, e) => acc + (Number(e.efectivo) || 0), 0)
  const sumaGanancia = equipos.reduce((acc, e) => acc + (Number(e.ganancia_acumulada) || 0), 0)
  const ordenEquipos = [...equipos].sort((a, b) => (b.ganancia_acumulada || 0) - (a.ganancia_acumulada || 0))
  const maxGanancia = Math.max(1, ...ordenEquipos.map((e) => Number(e.ganancia_acumulada) || 0))
  const chartData = Array.from({ length: Math.max(1, Math.min(rondaActual || 1, rondasTotales || 8)) }).map((_, idx) => {
    const p = idx + 1
    const ventas = Math.round((p / Math.max(1, rondasTotales || 8)) * (sumaEfectivo * 0.55 + 1200000))
    const utilidad = Math.round((p / Math.max(1, rondasTotales || 8)) * (sumaGanancia * 0.6 + 250000))
    return { periodo: `R${p}`, ventas, utilidad }
  })

  const activityItems = [
    { time: '14:35', title: 'TechZone', desc: 'tomó decisión en la ronda 3', kind: 'ok' as const },
    { time: '14:32', title: 'NovaTech', desc: 'actualizó estrategia de precios', kind: 'info' as const },
    { time: '14:30', title: 'DigitalPro', desc: 'cargó inversión de I+D', kind: 'warn' as const },
    { time: '14:28', title: 'SmartLab', desc: 'solicitó préstamo bancario', kind: 'info' as const },
    { time: '14:25', title: 'ByteCorp', desc: 'aumentó producción a 100%', kind: 'ok' as const },
  ]

  const marketNews = [
    {
      title: 'BOOM TECNOLÓGICO',
      tag: 'Evento positivo',
      text: 'La demanda de productos tecnológicos aumenta 20% esta ronda.',
      color: 'from-emerald-500/30 to-emerald-500/0',
      accent: 'text-emerald-300',
      meta: '1 / 3 rondas restantes',
    },
    {
      title: 'INFLACIÓN',
      tag: 'Evento negativo',
      text: 'Los costos de producción aumentan 15% esta ronda.',
      color: 'from-amber-500/30 to-amber-500/0',
      accent: 'text-amber-300',
      meta: '1 / 3 rondas restantes',
    },
    {
      title: 'NUEVO SUBSIDIO',
      tag: 'Evento positivo',
      text: 'Incentivos a inversión en I+D esta ronda.',
      color: 'from-sky-500/30 to-sky-500/0',
      accent: 'text-sky-300',
      meta: '2 / 3 rondas restantes',
    },
  ]

  return (
    <div className="min-h-screen org-shell">
      <div className="mx-auto max-w-[1320px] px-4 py-6">
        <div className="grid grid-cols-[280px_1fr] gap-6">
          <aside className="org-panel p-4 text-white/90">
            <div className="flex items-center gap-3 px-3 py-3">
              <div className="h-9 w-9 rounded-xl org-btn-primary" />
              <div className="leading-tight">
                <div className="text-sm font-extrabold tracking-wide">EMPRENDE</div>
                <div className="text-xs font-semibold text-white/60">SIMULADOR EMPRESARIAL</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="px-3 text-[10px] font-bold tracking-widest text-white/40">GESTIÓN DEL TORNEO</div>
              <button className="w-full org-btn-primary text-white rounded-xl px-3 py-2.5 text-left font-semibold shadow flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 border border-white/10">▦</span>
                Vista General
              </button>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">🏷</span>
                Equipos
              </button>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">👥</span>
                Estudiantes
              </button>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">⏱</span>
                Rondas
              </button>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">⚡</span>
                Eventos
              </button>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">📰</span>
                Noticias
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <div className="px-3 text-[10px] font-bold tracking-widest text-white/40">MONITOREO</div>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">🏆</span>
                Ranking en vivo
              </button>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">📄</span>
                Reportes
              </button>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">📈</span>
                Analíticas
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <div className="px-3 text-[10px] font-bold tracking-widest text-white/40">HERRAMIENTAS</div>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">✉</span>
                Mensajes
              </button>
              <button className="w-full org-btn-secondary text-white/80 rounded-xl px-3 py-2.5 text-left font-semibold flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/10">⚙</span>
                Configuración
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <div className="px-3 text-[10px] font-bold tracking-widest text-white/40">TEMPORADAS</div>
              <div className="org-panel org-panel-soft p-3">
                <div className="text-xs font-semibold text-white/60">Temporada actual</div>
                <div className="mt-1 text-sm font-extrabold text-white">
                  {competenciaSeleccionada?.nombre || 'Sin competencia'}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  {equiposCount} equipos • {estudiantesCount} estudiantes
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex-1 org-btn-secondary text-white rounded-xl px-3 py-2 text-sm font-semibold"
                  >
                    + Nueva
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 org-btn-secondary text-white rounded-xl px-3 py-2 text-sm font-semibold"
                  >
                    Salir
                  </button>
                </div>
              </div>
              <div className="mt-2 max-h-[260px] overflow-y-auto pr-1 space-y-2">
                {competencias.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => setSelectedCompetencia(comp.id)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left transition ${
                      competenciaSeleccionada?.id === comp.id ? 'org-btn-primary text-white' : 'org-btn-secondary text-white/85'
                    }`}
                  >
                    <div className="text-sm font-bold truncate">{comp.nombre}</div>
                    <div className="text-xs text-white/60">
                      Período {comp.periodo_actual}/{comp.total_periodos} • {comp.estado}
                    </div>
                  </button>
                ))}
                {competencias.length === 0 && (
                  <div className="text-sm text-white/60 px-3 py-4">Crea una competencia para comenzar.</div>
                )}
              </div>
            </div>
          </aside>

          <main className="text-white">
            <div className="grid grid-cols-[1.2fr_1fr_0.9fr_0.9fr_220px] gap-3 items-stretch">
              <div className="org-panel p-4">
                <div className="text-[10px] font-bold tracking-widest text-white/50">TEMPORADA ACTUAL</div>
                <div className="mt-1 text-lg font-extrabold">{competenciaSeleccionada?.nombre || '—'}</div>
                <div className="mt-1 text-xs text-white/60">
                  {equiposCount} equipos • {estudiantesCount} estudiantes
                </div>
              </div>

              <div className="org-panel p-4">
                <div className="text-[10px] font-bold tracking-widest text-white/50">RONDA {rondaActual || 1} EN PROGRESO</div>
                <div className="mt-1 text-2xl font-extrabold tabular-nums">02 : 15 : 36</div>
                <div className="mt-1 text-xs text-white/60">Días • Horas • Min • Seg</div>
              </div>

              <div className="org-panel p-4">
                <div className="text-[10px] font-bold tracking-widest text-white/50">ESTADO DE LA RONDA</div>
                <div className="mt-2 inline-flex items-center gap-2 org-pill px-3 py-1.5 text-sm font-bold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  Abierta
                </div>
                <div className="mt-2 text-xs text-white/60">
                  {competenciaSeleccionada?.estado === 'finalizada'
                    ? 'Finalizada'
                    : competenciaSeleccionada?.estado === 'preparacion'
                      ? 'En preparación'
                      : 'En curso'}
                </div>
              </div>

              <div className="org-panel p-4">
                <div className="text-[10px] font-bold tracking-widest text-white/50">SIGUIENTE EVENTO</div>
                <div className="mt-1 text-sm font-extrabold">Anuncio económico</div>
                <div className="mt-1 text-xs text-white/60">En 15:30 min</div>
              </div>

              <div className="org-panel p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-white/10 border border-white/10" />
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold truncate">{user.email}</div>
                    <div className="text-xs text-white/60">Organizador</div>
                  </div>
                </div>
                <button className="org-btn-secondary rounded-xl px-3 py-2 text-white/80 text-sm font-semibold">
                  ▾
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-6 gap-3">
              <div className="org-panel p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-lg">🏷</div>
                <div>
                  <div className="text-white/60 text-xs font-semibold">Equipos</div>
                  <div className="mt-1 text-2xl font-extrabold">{equiposCount}</div>
                  <div className="text-white/50 text-xs">Todos activos</div>
                </div>
              </div>
              <div className="org-panel p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-lg">👥</div>
                <div>
                  <div className="text-white/60 text-xs font-semibold">Estudiantes</div>
                  <div className="mt-1 text-2xl font-extrabold">{estudiantesCount}</div>
                  <div className="text-white/50 text-xs">{equiposCount > 0 ? `${Math.round(estudiantesCount / equiposCount)} por equipo` : '—'}</div>
                </div>
              </div>
              <div className="org-panel p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-lg">✅</div>
                <div>
                  <div className="text-white/60 text-xs font-semibold">Rondas completadas</div>
                  <div className="mt-1 text-2xl font-extrabold">
                    {rondasCompletadas} / {rondasTotales || '—'}
                  </div>
                  <div className="text-white/50 text-xs">{rondasTotales ? `${Math.round((rondasCompletadas / rondasTotales) * 100)}% del torneo` : '—'}</div>
                </div>
              </div>
              <div className="org-panel p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-lg">🔥</div>
                <div>
                  <div className="text-white/60 text-xs font-semibold">Ventas totales del mercado</div>
                  <div className="mt-1 text-2xl font-extrabold">{formatCurrency(Math.round(sumaEfectivo * 0.9))}</div>
                  <div className="text-white/50 text-xs">En esta ronda</div>
                </div>
              </div>
              <div className="org-panel p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-lg">💲</div>
                <div>
                  <div className="text-white/60 text-xs font-semibold">Utilidad total acumulada</div>
                  <div className="mt-1 text-2xl font-extrabold">{formatCurrency(sumaGanancia)}</div>
                  <div className="text-white/50 text-xs">Todas las rondas</div>
                </div>
              </div>
              <div className="org-panel p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-lg">📈</div>
                <div>
                  <div className="text-white/60 text-xs font-semibold">Crecimiento del mercado</div>
                  <div className="mt-1 text-2xl font-extrabold">+12.4%</div>
                  <div className="text-white/50 text-xs">vs ronda anterior</div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[1.45fr_1fr_0.9fr] gap-3">
              <div className="org-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold tracking-wide text-white/80">RENDIMIENTO DE EQUIPOS</div>
                  <button
                    onClick={() => setShowCreateTeamForm(true)}
                    className="org-btn-secondary rounded-xl px-3 py-2 text-xs font-semibold text-white"
                  >
                    + Nuevo Equipo
                  </button>
                </div>
                <div className="mt-3 overflow-hidden rounded-xl border org-divider">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-white/70">
                      <tr>
                        <th className="px-3 py-2 font-semibold">POS</th>
                        <th className="px-3 py-2 font-semibold">EQUIPO</th>
                        <th className="px-3 py-2 font-semibold text-right">UTILIDAD ACUMULADA</th>
                        <th className="px-3 py-2 font-semibold text-right">VENTAS TOTALES</th>
                        <th className="px-3 py-2 font-semibold text-right">MARKET SHARE</th>
                        <th className="px-3 py-2 font-semibold text-center">REPUTACIÓN</th>
                        <th className="px-3 py-2 font-semibold text-center">ESTADO</th>
                        <th className="px-3 py-2 font-semibold text-right">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y org-divider">
                      {ordenEquipos.map((equipo, idx) => {
                        const ratio = (Number(equipo.ganancia_acumulada) || 0) / maxGanancia
                        const stars = Math.max(1, Math.min(5, Math.round(ratio * 5)))
                        const marketShare = equiposCount ? Math.round((100 / equiposCount) * 10) / 10 : 0
                        const ventasTotales = Math.round((Number(equipo.efectivo) || 0) * 0.82)
                        return (
                          <tr key={equipo.id} className="hover:bg-white/5">
                            <td className="px-3 py-2 text-white/70 tabular-nums">
                              {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center text-[10px] font-extrabold">
                                  {equipo.nombre.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-extrabold truncate">{equipo.nombre}</div>
                                  <div className="text-[10px] text-white/50">{equipo.miembros?.length || 0} miembros</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right font-extrabold tabular-nums">
                              {formatCurrency(equipo.ganancia_acumulada)}
                            </td>
                            <td className="px-3 py-2 text-right font-extrabold tabular-nums">
                              {formatCurrency(ventasTotales)}
                            </td>
                            <td className="px-3 py-2 text-right text-white/80 font-semibold tabular-nums">{marketShare}%</td>
                            <td className="px-3 py-2 text-center">
                              <div className="inline-flex gap-0.5 text-[12px]">
                                {Array.from({ length: 5 }).map((_, s) => (
                                  <span key={s} className={s < stars ? 'text-yellow-300' : 'text-white/20'}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className="org-pill px-2 py-1 text-[10px] font-bold text-white/80">
                                {equipo.estado === 'activa' ? 'Estable' : equipo.estado === 'critica' ? 'En baja' : 'En crisis'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button
                                onClick={() => {
                                  setSelectedTeamForMembers(equipo.id)
                                  setShowAddMemberModal(true)
                                }}
                                className="org-btn-secondary rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-white"
                              >
                                Gestionar
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {equipos.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-3 py-8 text-center text-white/60">
                            No hay equipos en esta competencia
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex gap-3">
                  {competenciaSeleccionada?.estado === 'preparacion' && (
                    <button
                      onClick={handleStartCompetencia}
                      disabled={startingCompetencia}
                      className="org-btn-primary rounded-xl px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
                    >
                      {startingCompetencia ? 'Iniciando...' : 'Iniciar competencia'}
                    </button>
                  )}
                  {competenciaSeleccionada?.estado === 'en_curso' && (
                    <button
                      onClick={handleProcessPeriodo}
                      disabled={processingPeriodo}
                      className="org-btn-primary rounded-xl px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
                    >
                      {processingPeriodo ? 'Procesando...' : 'Procesar período'}
                    </button>
                  )}
                  <div className="flex-1" />
                  <div className="org-pill px-3 py-2 text-xs font-semibold text-white/70">
                    Período {rondaActual}/{rondasTotales || '—'}
                  </div>
                </div>
              </div>

              <div className="org-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold tracking-wide text-white/80">ACTIVIDAD EN TIEMPO REAL</div>
                  <button className="text-xs font-semibold text-white/60 hover:text-white/90">Ver todos</button>
                </div>
                <div className="mt-3 space-y-2">
                  {activityItems.map((a) => (
                    <div key={`${a.time}-${a.title}`} className="org-panel org-panel-soft px-3 py-2 flex items-center gap-3">
                      <div className="w-12 text-[10px] text-white/50 font-semibold tabular-nums">{a.time}</div>
                      <div
                        className={`h-8 w-8 rounded-xl border border-white/10 flex items-center justify-center text-sm ${
                          a.kind === 'ok' ? 'bg-emerald-500/15 text-emerald-200' : a.kind === 'warn' ? 'bg-amber-500/15 text-amber-200' : 'bg-sky-500/15 text-sky-200'
                        }`}
                      >
                        {a.kind === 'ok' ? '✓' : a.kind === 'warn' ? '!' : 'i'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold truncate">{a.title}</div>
                        <div className="text-[10px] text-white/60 truncate">{a.desc}</div>
                      </div>
                      <div className="ml-auto text-[10px] text-white/50">2 min</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="org-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold tracking-wide text-white/80">NOTICIAS DEL MERCADO</div>
                  <button className="text-xs font-semibold text-white/60 hover:text-white/90">Ver todas</button>
                </div>
                <div className="mt-3 space-y-2">
                  {marketNews.map((n) => (
                    <div key={n.title} className="org-panel org-panel-soft p-3 relative overflow-hidden">
                      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${n.color}`} />
                      <div className="relative">
                        <div className="flex items-center justify-between">
                          <div className={`text-xs font-extrabold ${n.accent}`}>{n.title}</div>
                          <div className="text-[10px] text-white/50">{n.tag}</div>
                        </div>
                        <div className="mt-2 text-xs text-white/70">{n.text}</div>
                        <div className="mt-2 text-[10px] text-white/50">{n.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[0.9fr_1.1fr_1fr] gap-3">
              <div className="org-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold tracking-wide text-white/80">ESTADO DE RONDAS</div>
                  <button className="text-xs font-semibold text-white/60 hover:text-white/90">Ver calendario</button>
                </div>
                <div className="mt-3 space-y-2">
                  {Array.from({ length: Math.min(6, rondasTotales || 6) }).map((_, idx) => {
                    const ronda = idx + 1
                    const status =
                      ronda < rondaActual ? 'Completada' : ronda === rondaActual ? 'En curso' : 'Próxima'
                    return (
                      <div key={ronda} className="org-panel org-panel-soft px-3 py-2 flex items-center justify-between">
                        <div className="text-xs font-bold">Ronda {ronda}</div>
                        <div className="text-[10px] text-white/60">{status}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="org-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold tracking-wide text-white/80">EVOLUCIÓN DEL MERCADO</div>
                  <button className="text-xs font-semibold text-white/60 hover:text-white/90">Ver analíticas</button>
                </div>
                <div className="mt-3 org-panel org-panel-soft p-4 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.12)' }} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} axisLine={{ stroke: 'rgba(255,255,255,0.12)' }} tickLine={false} width={34} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(10,12,24,0.9)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 12,
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: 12,
                        }}
                        labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                        formatter={(value: any) => formatCurrency(Number(value) || 0)}
                      />
                      <Line type="monotone" dataKey="ventas" stroke="#43d692" strokeWidth={2} dot={false} name="Ventas totales" />
                      <Line type="monotone" dataKey="utilidad" stroke="#7852ff" strokeWidth={2} dot={false} name="Utilidad total" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="org-panel org-panel-soft p-3">
                    <div className="text-[10px] text-white/50 font-bold">Efectivo promedio</div>
                    <div className="text-sm font-extrabold">{equiposCount ? formatCurrency(Math.round(sumaEfectivo / equiposCount)) : '—'}</div>
                  </div>
                  <div className="org-panel org-panel-soft p-3">
                    <div className="text-[10px] text-white/50 font-bold">Utilidad promedio</div>
                    <div className="text-sm font-extrabold">{equiposCount ? formatCurrency(Math.round(sumaGanancia / equiposCount)) : '—'}</div>
                  </div>
                  <div className="org-panel org-panel-soft p-3">
                    <div className="text-[10px] text-white/50 font-bold">Participación</div>
                    <div className="text-sm font-extrabold">12.5%</div>
                  </div>
                </div>
              </div>

              <div className="org-panel p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold tracking-wide text-white/80">EQUIPOS Y ESTUDIANTES</div>
                  <button className="text-xs font-semibold text-white/60 hover:text-white/90">Ver todos</button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {equipos.slice(0, 8).map((e) => (
                    <div key={e.id} className="org-panel org-panel-soft p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-extrabold">{e.nombre}</div>
                        <div className="text-[10px] text-white/60">{e.miembros?.length || 0} conectados</div>
                      </div>
                      <div className="mt-2 flex -space-x-2">
                        {(e.miembros || []).slice(0, 4).map((m) => (
                          <div key={m} className="h-6 w-6 rounded-full bg-white/10 border border-white/10" />
                        ))}
                        {(e.miembros || []).length === 0 && (
                          <div className="text-[10px] text-white/50">Sin miembros</div>
                        )}
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full org-btn-primary"
                          style={{ width: `${Math.min(100, Math.round(((e.miembros?.length || 0) / Math.max(1, Math.max(...equipos.map((t) => t.miembros?.length || 0), 4))) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-3 w-full org-btn-primary rounded-xl px-4 py-3 text-sm font-extrabold">
                  Enviar mensaje a todos los equipos
                </button>
              </div>
            </div>

            {message && (
              <div className="mt-4 org-panel org-panel-soft p-3 text-sm">
                <span className={message.type === 'success' ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                  {message.type === 'success' ? '✓ ' : '✕ '}
                </span>
                <span className="text-white/80">{message.text}</span>
              </div>
            )}

            <div className="mt-4 org-panel p-3 flex items-center justify-between gap-3">
              <div className="text-xs text-white/60">
                Centro de control del organizador
                <span className="text-white/40"> • </span>
                Supervisa, guía y acompaña a los equipos en su camino al éxito.
              </div>
              <div className="flex items-center gap-2">
                <button className="org-btn-secondary rounded-xl px-4 py-2 text-xs font-extrabold text-white/90">
                  Generar reporte
                </button>
                <button className="org-btn-secondary rounded-xl px-4 py-2 text-xs font-extrabold text-white/90">
                  Exportar datos
                </button>
                <button className="org-btn-primary rounded-xl px-4 py-2 text-xs font-extrabold text-white">
                  Anunciar evento
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="org-panel p-5 w-full max-w-lg text-white">
            <div className="flex items-center justify-between">
              <div className="text-lg font-extrabold">Nueva Competencia</div>
              <button onClick={() => setShowCreateForm(false)} className="org-btn-secondary rounded-xl px-3 py-2 text-white/80 font-semibold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCompetencia} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={createFormData.nombre}
                  onChange={(e) => setCreateFormData({ ...createFormData, nombre: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  placeholder="Ej: Simulación Empresarial 2026"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Descripción</label>
                <textarea
                  value={createFormData.descripcion}
                  onChange={(e) => setCreateFormData({ ...createFormData, descripcion: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Total de períodos</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    required
                    value={createFormData.total_periodos}
                    onChange={(e) => setCreateFormData({ ...createFormData, total_periodos: parseInt(e.target.value) })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Capital inicial</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={createFormData.capital_inicial}
                    onChange={(e) => setCreateFormData({ ...createFormData, capital_inicial: parseInt(e.target.value) })}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 org-btn-secondary rounded-xl px-4 py-3 text-sm font-extrabold text-white/90"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingCompetencia}
                  className="flex-1 org-btn-primary rounded-xl px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
                >
                  {creatingCompetencia ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateTeamForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="org-panel p-5 w-full max-w-lg text-white">
            <div className="flex items-center justify-between">
              <div className="text-lg font-extrabold">Nuevo Equipo</div>
              <button onClick={() => setShowCreateTeamForm(false)} className="org-btn-secondary rounded-xl px-3 py-2 text-white/80 font-semibold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTeam} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Nombre del equipo</label>
                <input
                  type="text"
                  required
                  value={createTeamFormData.nombre}
                  onChange={(e) => setCreateTeamFormData({ ...createTeamFormData, nombre: e.target.value })}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  placeholder="Ej: Los Emprendedores"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamForm(false)}
                  className="flex-1 org-btn-secondary rounded-xl px-4 py-3 text-sm font-extrabold text-white/90"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingTeam}
                  className="flex-1 org-btn-primary rounded-xl px-4 py-3 text-sm font-extrabold text-white disabled:opacity-50"
                >
                  {creatingTeam ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMemberModal && selectedTeamForMembers && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="org-panel p-5 w-full max-w-lg text-white">
            <div className="flex items-center justify-between">
              <div className="text-lg font-extrabold">Agregar miembro</div>
              <button
                onClick={() => {
                  setShowAddMemberModal(false)
                  setSelectedTeamForMembers(null)
                }}
                className="org-btn-secondary rounded-xl px-3 py-2 text-white/80 font-semibold"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 text-xs text-white/60">
              Equipo: {equipos.find((e) => e.id === selectedTeamForMembers)?.nombre || '—'}
            </div>
            <div className="mt-4">
              {loadingUsuarios ? (
                <div className="text-white/70">Cargando usuarios...</div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                  {usuarios
                    .filter((u) => u.rol === 'student' || !u.rol)
                    .map((usuario) => {
                      const equipo = equipos.find((e) => e.id === selectedTeamForMembers)
                      const isMember = equipo?.miembros?.includes(usuario.uid)
                      return (
                        <div key={usuario.uid} className="org-panel org-panel-soft px-3 py-2 flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-sm font-bold truncate">{usuario.nombre || usuario.email}</div>
                            <div className="text-[10px] text-white/60 truncate">{usuario.email}</div>
                          </div>
                          {isMember ? (
                            <div className="org-pill px-3 py-1 text-[10px] font-extrabold text-emerald-300">Agregado</div>
                          ) : (
                            <button
                              onClick={() => handleAddMember(usuario.uid)}
                              className="org-btn-primary rounded-lg px-3 py-2 text-[10px] font-extrabold text-white"
                            >
                              Agregar
                            </button>
                          )}
                        </div>
                      )
                    })}
                  {usuarios.filter((u) => u.rol === 'student' || !u.rol).length === 0 && (
                    <div className="text-white/60 text-center py-10">No hay estudiantes visibles.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
