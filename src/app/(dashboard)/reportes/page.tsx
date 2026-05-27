'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Tabs from '@/components/ui/Tabs'
import { useFormatCurrency, useUsuarioEquipo, useResultadosEquipo } from '@/lib/hooks'
import { getResultadoEquipoPeriodo } from '@/lib/db'
import type { ResultadoPeriodo } from '@/types'

export default function ReportesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const formatCurrency = useFormatCurrency()
  const { equipo, loading: equipoLoading } = useUsuarioEquipo(user?.uid || '')
  const { resultados } = useResultadosEquipo(equipo?.id || '', equipo?.competencia_id || '')

  const [selectedPeriodo, setSelectedPeriodo] = useState(1)
  const [resultado, setResultado] = useState<ResultadoPeriodo | null>(null)
  const [loadingResultado, setLoadingResultado] = useState(false)

  useEffect(() => {
    const loadResultado = async () => {
      if (!equipo) return
      setLoadingResultado(true)
      try {
        const data = await getResultadoEquipoPeriodo(equipo.id, equipo.competencia_id, selectedPeriodo)
        setResultado(data)
      } catch (err) {
        console.error('Error cargando resultado:', err)
      } finally {
        setLoadingResultado(false)
      }
    }

    loadResultado()
  }, [selectedPeriodo, equipo])

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

  // Calcular datos de balance a partir del resultado
  const balanceGeneral = resultado
    ? {
        activos: {
          efectivo: resultado.efectivo,
          inventario: resultado.inventario,
          activos_fijos: 50000,
          total: resultado.efectivo + resultado.inventario + 50000,
        },
        pasivos: {
          deuda_corto_plazo: Math.max(0, resultado.indice_deuda * resultado.ingresos * 0.6),
          deuda_largo_plazo: Math.max(0, resultado.indice_deuda * resultado.ingresos * 0.4),
          total: resultado.indice_deuda * resultado.ingresos,
        },
        patrimonio: {
          capital_inicial: 150000,
          ganancias_acumuladas: resultado.ganancia_acumulada,
          total: 150000 + resultado.ganancia_acumulada,
        },
      }
    : null

  const estadoResultados = resultado
    ? {
        ventas: resultado.ingresos,
        costo_mercaderia: resultado.costos_variables,
        ganancia_bruta: resultado.ganancia_bruta,
        gastos_operativos: resultado.costos_fijos,
        ebitda: resultado.ganancia_bruta - resultado.costos_fijos,
        impuestos: resultado.impuestos,
        ganancia_neta: resultado.ganancia_neta,
      }
    : null

  const flujoCaja = resultado
    ? {
        efectivo_inicio: resultado.efectivo - resultado.ganancia_neta,
        ingresos: resultado.ingresos,
        egresos: resultado.costos_fijos + resultado.costos_variables + resultado.impuestos,
        flujo_operativo: resultado.ganancia_neta,
        flujo_financiero: 0,
        efectivo_final: resultado.efectivo,
      }
    : null

  const kpis = resultado
    ? {
        margen_neto: resultado.margen_neto,
        roa: resultado.roa,
        deuda_equity: resultado.indice_deuda > 0 ? resultado.indice_deuda : 0,
        current_ratio: resultado.efectivo / Math.max(1, resultado.indice_deuda * resultado.ingresos),
        roic: resultado.roa,
      }
    : null

  const tabs = [
    {
      label: 'Balance General',
      icon: '📊',
      content: balanceGeneral ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="bg-purple-50">
                  <td colSpan={2} className="px-4 py-2 font-bold text-gray-900">
                    ACTIVOS
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Efectivo en Caja</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(balanceGeneral.activos.efectivo)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Inventario</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(balanceGeneral.activos.inventario)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Activos Fijos</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(balanceGeneral.activos.activos_fijos)}
                  </td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-4 py-2 font-bold text-gray-900">TOTAL ACTIVOS</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-600">
                    {formatCurrency(balanceGeneral.activos.total)}
                  </td>
                </tr>

                <tr className="bg-red-50">
                  <td colSpan={2} className="px-4 py-2 font-bold text-gray-900 mt-4">
                    PASIVOS
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Deuda Corto Plazo</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(balanceGeneral.pasivos.deuda_corto_plazo)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Deuda Largo Plazo</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(balanceGeneral.pasivos.deuda_largo_plazo)}
                  </td>
                </tr>
                <tr className="bg-red-100">
                  <td className="px-4 py-2 font-bold text-gray-900">TOTAL PASIVOS</td>
                  <td className="px-4 py-2 text-right font-bold text-red-600">
                    {formatCurrency(balanceGeneral.pasivos.total)}
                  </td>
                </tr>

                <tr className="bg-green-50">
                  <td colSpan={2} className="px-4 py-2 font-bold text-gray-900 mt-4">
                    PATRIMONIO
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Capital Inicial</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(balanceGeneral.patrimonio.capital_inicial)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Ganancias Acumuladas</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(balanceGeneral.patrimonio.ganancias_acumuladas)}
                  </td>
                </tr>
                <tr className="bg-green-100">
                  <td className="px-4 py-2 font-bold text-gray-900">TOTAL PATRIMONIO</td>
                  <td className="px-4 py-2 text-right font-bold text-green-600">
                    {formatCurrency(balanceGeneral.patrimonio.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No hay datos para este período</p>
      ),
    },
    {
      label: 'Estado de Resultados',
      icon: '📈',
      content: estadoResultados ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Ventas</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(estadoResultados.ventas)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Costo de Mercadería</td>
                  <td className="px-4 py-2 text-right font-semibold text-red-600">
                    ({formatCurrency(estadoResultados.costo_mercaderia)})
                  </td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-4 py-2 font-bold text-gray-900">Ganancia Bruta</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-600">
                    {formatCurrency(estadoResultados.ganancia_bruta)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Gastos Operativos</td>
                  <td className="px-4 py-2 text-right font-semibold text-red-600">
                    ({formatCurrency(estadoResultados.gastos_operativos)})
                  </td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="px-4 py-2 font-bold text-gray-900">EBITDA</td>
                  <td className="px-4 py-2 text-right font-bold text-purple-600">
                    {formatCurrency(estadoResultados.ebitda)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Impuestos (30%)</td>
                  <td className="px-4 py-2 text-right font-semibold text-red-600">
                    ({formatCurrency(estadoResultados.impuestos)})
                  </td>
                </tr>
                <tr className="bg-green-100">
                  <td className="px-4 py-2 font-bold text-gray-900">GANANCIA NETA</td>
                  <td className="px-4 py-2 text-right font-bold text-green-600">
                    {formatCurrency(estadoResultados.ganancia_neta)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No hay datos para este período</p>
      ),
    },
    {
      label: 'Flujo de Caja',
      icon: '💵',
      content: flujoCaja ? (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Efectivo Inicio Período</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(flujoCaja.efectivo_inicio)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-semibold text-green-700">+ Ingresos por Ventas</td>
                  <td className="px-4 py-2 text-right font-semibold text-green-600">
                    {formatCurrency(flujoCaja.ingresos)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 font-semibold text-red-700">- Egresos Operativos</td>
                  <td className="px-4 py-2 text-right font-semibold text-red-600">
                    ({formatCurrency(flujoCaja.egresos)})
                  </td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-4 py-2 font-bold text-gray-900">= Flujo Operativo</td>
                  <td className="px-4 py-2 text-right font-bold text-blue-600">
                    {formatCurrency(flujoCaja.flujo_operativo)}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="px-4 py-2 text-gray-700">Flujo Financiero</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    {formatCurrency(flujoCaja.flujo_financiero)}
                  </td>
                </tr>
                <tr className="bg-green-100">
                  <td className="px-4 py-2 font-bold text-gray-900">Efectivo Final Período</td>
                  <td className="px-4 py-2 text-right font-bold text-green-600">
                    {formatCurrency(flujoCaja.efectivo_final)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No hay datos para este período</p>
      ),
    },
    {
      label: 'KPIs',
      icon: '📊',
      content: kpis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
            <p className="text-sm text-gray-600">Margen Neto</p>
            <p className="text-3xl font-bold text-purple-600">{kpis.margen_neto.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-2">Ganancia sobre ventas totales</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <p className="text-sm text-gray-600">ROA (Retorno sobre Activos)</p>
            <p className="text-3xl font-bold text-green-600">{kpis.roa.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-2">Eficiencia de utilización de activos</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <p className="text-sm text-gray-600">Ratio Deuda/Equity</p>
            <p className="text-3xl font-bold text-blue-600">{kpis.deuda_equity.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{kpis.deuda_equity === 0 ? 'Saludable' : 'En deuda'}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
            <p className="text-sm text-gray-600">ROIC (Retorno sobre Capital)</p>
            <p className="text-3xl font-bold text-yellow-600">{kpis.roic.toFixed(2)}%</p>
            <p className="text-xs text-gray-500 mt-2">Rentabilidad del capital invertido</p>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No hay datos para este período</p>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/dashboard" className="text-purple-200 hover:text-white mb-6 inline-block">
          ← Volver al Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Reportes Financieros</h1>
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-medium">Período:</label>
              <select
                value={selectedPeriodo}
                onChange={(e) => setSelectedPeriodo(parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <option key={p} value={p} disabled={!resultados.find((r) => r.periodo === p)}>
                    Período {p} {!resultados.find((r) => r.periodo === p) ? '(No procesado)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingResultado ? (
            <p className="text-gray-600">Cargando datos...</p>
          ) : (
            <>
              <Tabs tabs={tabs} defaultTab={0} />

              <div className="mt-8 flex gap-4">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition">
                  📥 Descargar PDF
                </button>
                <button className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition">
                  📊 Descargar Excel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
