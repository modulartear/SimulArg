import { NextRequest, NextResponse } from 'next/server'
import { simularPeriodo, generarLaVoz } from '@/lib/simulation'
import {
  getDecisionesPeriodo,
  getEquiposCompetencia,
  guardarResultado,
  guardarReporte,
  guardarLaVoz,
  getResultadoEquipoPeriodo,
  actualizarEquipo,
} from '@/lib/db'
import type { Competencia, ResultadoPeriodo } from '@/types'
import { db } from '@/lib/firebase'
import { getDoc, doc, updateDoc } from 'firebase/firestore'

export async function POST(request: NextRequest) {
  try {
    const { competenciaId, periodo } = await request.json()

    if (!competenciaId || !periodo) {
      return NextResponse.json(
        { error: 'competenciaId y periodo son requeridos' },
        { status: 400 }
      )
    }

    // Obtener competencia
    const competenciaSnap = await getDoc(doc(db, 'competencias', competenciaId))
    if (!competenciaSnap.exists()) {
      return NextResponse.json(
        { error: 'Competencia no encontrada' },
        { status: 404 }
      )
    }
    const competencia = competenciaSnap.data() as Competencia

    // Obtener equipos
    const equipos = await getEquiposCompetencia(competenciaId)
    if (equipos.length === 0) {
      return NextResponse.json(
        { error: 'No hay equipos en esta competencia' },
        { status: 400 }
      )
    }

    // Obtener decisiones
    const decisiones = await getDecisionesPeriodo(competenciaId, periodo)
    if (decisiones.length === 0) {
      return NextResponse.json(
        { error: 'No hay decisiones para procesar' },
        { status: 400 }
      )
    }

    // Simular período
    const { resultados, evento } = await simularPeriodo(decisiones, equipos, periodo)

    // Guardar resultados en Firestore
    const resultadosGuardados: ResultadoPeriodo[] = []
    for (const [equipoId, resultado] of resultados) {
      resultado.competencia_id = competenciaId
      const resultadoId = await guardarResultado(resultado)
      resultadosGuardados.push({ ...resultado, id: resultadoId })

      // Actualizar datos del equipo
      await actualizarEquipo(equipoId, {
        efectivo: resultado.efectivo,
        inventario: resultado.inventario,
        deuda: resultado.indice_deuda,
        ganancia_acumulada: resultado.ganancia_acumulada,
        estado: resultado.estado as 'activa' | 'critica' | 'quiebra',
        periodo_actual: periodo,
      })
    }

    // Generar LA VOZ (análisis automático del período)
    const resultadosAnterior = new Map<string, any>()
    if (periodo > 1) {
      for (const equipo of equipos) {
        const resultadoAnterior = await getResultadoEquipoPeriodo(equipo.id, competenciaId, periodo - 1)
        if (resultadoAnterior) {
          resultadosAnterior.set(equipo.id, resultadoAnterior)
        }
      }
    }

    const laVozData = generarLaVoz(periodo, evento ? { ...evento } : null, resultadosAnterior)

    const laVozId = await guardarLaVoz({
      competencia_id: competenciaId,
      periodo,
      analisis_anterior: laVozData.analisis,
      eventos_ocurridos: laVozData.eventos,
      cambios_parametros: laVozData.cambios_parametros,
      limites_nuevo_periodo: laVozData.limites,
      ranking_anterior: [],
      consejos_estrategicos: generarConsejos(resultadosGuardados),
      timestamp: new Date(),
    })

    // Generar reportes financieros para cada equipo
    for (const resultado of resultadosGuardados) {
      const reporteData = {
        equipo_id: resultado.equipo_id,
        competencia_id: competenciaId,
        periodo,
        balance_general: {
          activos: {
            efectivo: resultado.efectivo,
            inventario: resultado.inventario,
            activos_fijos: 50000, // Valor fijo para MVP
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
        },
        estado_resultados: {
          ventas: resultado.ingresos,
          costo_mercaderia: resultado.costos_variables,
          ganancia_bruta: resultado.ganancia_bruta,
          gastos_operativos: resultado.costos_fijos,
          ebitda: resultado.ganancia_bruta - resultado.costos_fijos,
          impuestos: resultado.impuestos,
          ganancia_neta: resultado.ganancia_neta,
        },
        flujo_caja: {
          efectivo_inicio: resultado.efectivo - resultado.ganancia_neta,
          ingresos: resultado.ingresos,
          egresos: resultado.costos_fijos + resultado.costos_variables + resultado.impuestos,
          flujo_operativo: resultado.ganancia_neta,
          flujo_financiero: 0,
          efectivo_final: resultado.efectivo,
        },
        kpis: {
          margen_neto: resultado.margen_neto,
          roa: resultado.roa,
          deuda_equity: resultado.indice_deuda > 0 ? resultado.indice_deuda : 0,
          current_ratio: resultado.efectivo / Math.max(1, resultado.indice_deuda * resultado.ingresos),
          roic: resultado.roa,
        },
        timestamp: new Date(),
      }

      await guardarReporte(reporteData)
    }

    const nextPeriodo = periodo + 1
    const competenciaUpdates: Partial<Competencia> = {}
    if (nextPeriodo > competencia.total_periodos) {
      competenciaUpdates.estado = 'finalizada'
      competenciaUpdates.periodo_actual = competencia.total_periodos
    } else {
      competenciaUpdates.estado = 'en_curso'
      competenciaUpdates.periodo_actual = nextPeriodo
    }
    await updateDoc(doc(db, 'competencias', competenciaId), {
      ...competenciaUpdates,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      periodo,
      equiposProcesados: resultadosGuardados.length,
      evento: evento || null,
      laVozId,
      message: `Período ${periodo} procesado exitosamente`,
    })
  } catch (error) {
    console.error('Error procesando período:', error)
    return NextResponse.json(
      {
        error: 'Error al procesar período',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    )
  }
}

function generarConsejos(resultados: ResultadoPeriodo[]): string[] {
  const consejos: string[] = []

  // Analizar márgenes
  const margenesBajos = resultados.filter((r) => r.margen_neto < 15)
  if (margenesBajos.length > 0) {
    consejos.push('⚠️ Algunos equipos tienen márgenes muy bajos. Consideren reducir costos o aumentar precios.')
  }

  // Analizar deuda
  const equiposEnDeuda = resultados.filter((r) => r.estado === 'CRITICA' || r.estado === 'QUIEBRA')
  if (equiposEnDeuda.length > 0) {
    consejos.push('⚠️ Hay equipos en estado crítico. Requieren estrategias urgentes de recuperación.')
  }

  // Analizar cuota de mercado
  const cuotasAltas = resultados.filter((r) => r.cuota_mercado > 30)
  if (cuotasAltas.length > 0) {
    consejos.push('✨ Algunos equipos dominan el mercado. El resto debe diferenciarse.')
  }

  // Consejos generales
  if (resultados.some((r) => r.margen_neto > 25)) {
    consejos.push('💡 Los mejores márgenes se logran con marketing estratégico + control de costos.')
  }

  return consejos.length > 0 ? consejos : ['El mercado está en equilibrio. Continúen optimizando.']
}
