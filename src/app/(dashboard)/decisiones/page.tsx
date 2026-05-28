'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'
import Tabs from '@/components/ui/Tabs'
import { useFormatCurrency, useUsuarioEquipo } from '@/lib/hooks'
import { guardarDecision, getDecisionEquipoPeriodo } from '@/lib/db'
import { useEffect } from 'react'

export default function DecisionesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const formatCurrency = useFormatCurrency()
  const { equipo, loading: equipoLoading } = useUsuarioEquipo(user?.uid || '')

  const [formData, setFormData] = useState({
    produccion: 50,
    id: 5000,
    ampliacion: 0,
    precio: 91,
    marketing: 5000,
    empleados: 50,
    capacitacion: 2000,
    credito_nacion: 0,
    credito_crediar: 0,
    devoluciones: 0,
  })

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Cargar decisión existente si la hay
  useEffect(() => {
    const loadExistingDecision = async () => {
      if (!equipo) return
      try {
        const decision = await getDecisionEquipoPeriodo(
          equipo.id,
          equipo.competencia_id,
          equipo.periodo_actual
        )
        if (decision) {
          setFormData({
            produccion: decision.produccion,
            id: decision.id_inversion,
            ampliacion: decision.ampliacion_planta,
            precio: decision.precio,
            marketing: decision.marketing,
            empleados: decision.empleados,
            capacitacion: decision.capacitacion,
            credito_nacion: decision.credito_nacion,
            credito_crediar: decision.credito_crediar,
            devoluciones: decision.devoluciones,
          })
        }
      } catch (err) {
        console.error('Error cargando decisión:', err)
      }
    }

    loadExistingDecision()
  }, [equipo])

  if (loading || equipoLoading) return <div className="text-white text-center pt-20">Cargando...</div>
  if (!user) {
    router.push('/login')
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

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  // Validar límites
  const isValid =
    formData.id <= 10000 &&
    formData.ampliacion <= 15000 &&
    formData.precio >= 74 &&
    formData.precio <= 100 &&
    formData.marketing <= 10000 &&
    formData.capacitacion <= 20000 &&
    formData.credito_nacion <= 85000 &&
    formData.credito_crediar <= 80000

  // Calcular costos estimados
  const costoProduccion = (formData.produccion / 100) * 85000 * 10
  const costoLaboral = formData.empleados * 500
  const costoTotal =
    costoProduccion + formData.marketing + formData.id + formData.capacitacion + costoLaboral

  const ingresoEstimado = ((formData.produccion / 100) * 85000 * formData.precio) * 0.8
  const gananciEstimada = ingresoEstimado - costoTotal

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      await guardarDecision({
        equipo_id: equipo.id,
        competencia_id: equipo.competencia_id,
        periodo: equipo.periodo_actual,
        produccion: formData.produccion,
        calidad: 1.0,
        id_inversion: formData.id,
        ampliacion_planta: formData.ampliacion,
        precio: formData.precio,
        marketing: formData.marketing,
        empleados: formData.empleados,
        capacitacion: formData.capacitacion,
        credito_nacion: formData.credito_nacion,
        credito_crediar: formData.credito_crediar,
        devoluciones: formData.devoluciones,
        estado: 'borrador',
        timestamp: new Date(),
      })
      setMessage({ type: 'success', text: 'Decisión guardada como borrador' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al guardar',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const handleSubmit = async () => {
    if (!isValid) {
      setMessage({
        type: 'error',
        text: 'Por favor, verifica que todos los valores estén dentro de los límites permitidos',
      })
      return
    }

    setSaving(true)
    try {
      await guardarDecision({
        equipo_id: equipo.id,
        competencia_id: equipo.competencia_id,
        periodo: equipo.periodo_actual,
        produccion: formData.produccion,
        calidad: 1.0,
        id_inversion: formData.id,
        ampliacion_planta: formData.ampliacion,
        precio: formData.precio,
        marketing: formData.marketing,
        empleados: formData.empleados,
        capacitacion: formData.capacitacion,
        credito_nacion: formData.credito_nacion,
        credito_crediar: formData.credito_crediar,
        devoluciones: formData.devoluciones,
        estado: 'enviada',
        timestamp: new Date(),
      })
      setMessage({ type: 'success', text: '✓ Decisión enviada exitosamente' })
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al enviar decisión',
      })
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    {
      label: 'Producción',
      icon: '🏭',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel de Producción: {formData.produccion}%
            </label>
            <input
              type="range"
              min="25"
              max="100"
              step="25"
              value={formData.produccion}
              onChange={(e) => handleChange('produccion', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">Opciones: 25%, 50%, 75%, 100%</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inversión I+D: {formatCurrency(formData.id)}
            </label>
            <input
              type="number"
              min="0"
              max="10000"
              value={formData.id}
              onChange={(e) => handleChange('id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">Máximo: $10,000</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ampliación de Planta: {formatCurrency(formData.ampliacion)}
            </label>
            <input
              type="number"
              min="0"
              max="15000"
              value={formData.ampliacion}
              onChange={(e) => handleChange('ampliacion', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">Máximo: $15,000</div>
          </div>
        </div>
      ),
    },
    {
      label: 'Ventas',
      icon: '💳',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Unitario: {formatCurrency(formData.precio)}
            </label>
            <input
              type="number"
              min="74"
              max="100"
              value={formData.precio}
              onChange={(e) => handleChange('precio', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">Rango: $74 - $100</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              Ingresos estimados: <strong>{formatCurrency(ingresoEstimado)}</strong>
            </p>
          </div>
        </div>
      ),
    },
    {
      label: 'Marketing',
      icon: '📢',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inversión en Marketing: {formatCurrency(formData.marketing)}
            </label>
            <input
              type="number"
              min="0"
              max="10000"
              value={formData.marketing}
              onChange={(e) => handleChange('marketing', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">Máximo: $10,000 | Cada $1,000 = +2% demanda</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-900">
              Incremento de demanda estimado: <strong>+{((formData.marketing / 10000) * 20).toFixed(1)}%</strong>
            </p>
          </div>
        </div>
      ),
    },
    {
      label: 'RRHH',
      icon: '👥',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad de Empleados: {formData.empleados}
            </label>
            <input
              type="number"
              min="1"
              max="200"
              value={formData.empleados}
              onChange={(e) => handleChange('empleados', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacitación: {formatCurrency(formData.capacitacion)}
            </label>
            <input
              type="number"
              min="0"
              max="20000"
              value={formData.capacitacion}
              onChange={(e) => handleChange('capacitacion', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">Máximo: $20,000</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-900">
              Costo nómina: <strong>{formatCurrency(costoLaboral)}</strong>
            </p>
          </div>
        </div>
      ),
    },
    {
      label: 'Finanzas',
      icon: '💰',
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crédito Banco Nación: {formatCurrency(formData.credito_nacion)}
            </label>
            <input
              type="number"
              min="0"
              max="85000"
              value={formData.credito_nacion}
              onChange={(e) => handleChange('credito_nacion', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">Máximo: $85,000 | Tasa: 21% anual</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crédito Crediar: {formatCurrency(formData.credito_crediar)}
            </label>
            <input
              type="number"
              min="0"
              max="80000"
              value={formData.credito_crediar}
              onChange={(e) => handleChange('credito_crediar', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
            <div className="text-xs text-gray-500 mt-1">Máximo: $80,000 | Tasa: 27% anual</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devoluciones: {formatCurrency(formData.devoluciones)}
            </label>
            <input
              type="number"
              min="0"
              value={formData.devoluciones}
              onChange={(e) => handleChange('devoluciones', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <Link href="/dashboard" className="text-purple-200 hover:text-white">
            ← Volver al Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition font-semibold"
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Decisiones - Período {equipo.periodo_actual}/8
          </h1>
          <p className="text-gray-600 mb-6">Equipo: {equipo.nombre}</p>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <Tabs tabs={tabs} defaultTab={0} />

          {/* Preview de Impacto */}
          <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Vista Previa de Impacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Costo Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(costoTotal)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ingresos Estimados</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(ingresoEstimado)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ganancia Estimada</p>
                <p className={`text-2xl font-bold ${gananciEstimada > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(gananciEstimada)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Riesgo</p>
                <p
                  className={`text-2xl font-bold ${
                    gananciEstimada > 50000 ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  {gananciEstimada > 50000 ? 'BAJO' : 'MODERADO'}
                </p>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition"
            >
              {saving ? 'Guardando...' : '💾 Guardar Borrador'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || !isValid}
              className={`flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition`}
            >
              {saving ? 'Enviando...' : '✓ Enviar Decisión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
