import type { Decision, ResultadoPeriodo } from '@/types'

interface DatosEquipo {
  produccion: number
  demandaEquipo: number
  costos: number
  decision: Decision
  efectivoAnterior: number
  inventarioAnterior: number
}

interface Evento {
  tipo: 'crisis' | 'boom' | 'cambio_tec' | 'problema_laboral'
  factor: number
  descripcion: string
}

export const PARAMETROS_MERCADO = {
  demandaBase: 500,
  precioBase: 1000,
  costoLaboral: 500,
  tasaInteres: 0.15,
  tasaImpuesto: 0.30,
  volatilidad: 0.15,
}

// ============================================
// FASE 1: PROCESAR DECISIONES
// ============================================

function procesarDecisiones(
  decisiones: Decision[],
  equipos: any[]
): { datosEquipos: Map<string, DatosEquipo>; ofertaTotal: number } {
  const datosEquipos = new Map<string, DatosEquipo>()
  let ofertaTotal = 0

  for (const equipo of equipos) {
    const dec = decisiones.find((d) => d.equipo_id === equipo.id)
    if (!dec) continue

    // Validar restricciones
    const efectivoDisponible = Number(equipo.efectivo) || 0
    const costoProduccion = (Number(dec.produccion) / 100) * 85000 * 10
    const costoLaboral = Number(dec.empleados) * PARAMETROS_MERCADO.costoLaboral
    const costoTotal = costoProduccion + Number(dec.marketing) + Number(dec.id_inversion) + Number(dec.capacitacion) + costoLaboral

    let produccionAjustada = (Number(dec.produccion) / 100) * 85000
    if (costoTotal > efectivoDisponible * 1.5) {

      produccionAjustada *= (efectivoDisponible / costoTotal)
    }

    const produccion = produccionAjustada * (1 + (Math.random() - 0.5) * 0.2) // variación 0.8-1.2
    ofertaTotal += produccion

    // Calcular demanda base con marketing
    const multiplicadorMarketing = 1 + (Number(dec.marketing) / 10000) * 0.2
    const demandaEquipo = (PARAMETROS_MERCADO.demandaBase / equipos.length) * multiplicadorMarketing * 0.8 // 80% inercia

    datosEquipos.set(equipo.id, {
      produccion,
      demandaEquipo,
      costos: costoTotal,
      decision: dec,
      efectivoAnterior: equipo.efectivo,
      inventarioAnterior: equipo.inventario || 0,
    })
  }

  return { datosEquipos, ofertaTotal }
}

// ============================================
// FASE 2: EVENTO DE MERCADO
// ============================================

function generarEvento(): Evento | null {
  const probabilidad = 0.2 // 20%
  if (Math.random() > probabilidad) return null

  const tiposEventos: Evento[] = [
    { tipo: 'crisis', factor: 0.8, descripcion: 'Crisis económica global' },
    { tipo: 'boom', factor: 1.3, descripcion: 'Boom de mercado' },
    { tipo: 'cambio_tec', factor: 0.9, descripcion: 'Cambio tecnológico' },
    { tipo: 'problema_laboral', factor: 0.85, descripcion: 'Conflicto laboral' },
  ]

  return tiposEventos[Math.floor(Math.random() * tiposEventos.length)]
}

// ============================================
// FASE 3: CALCULAR DEMANDA
// ============================================

function calcularDemanda(datosEquipos: Map<string, DatosEquipo>, evento: Evento | null): number {
  let demandaTotal = 0

  for (const datos of datosEquipos.values()) {
    let demanda = datos.demandaEquipo

    if (evento) {
      demanda *= evento.factor
    }

    demanda *= 1 + (Math.random() - 0.5) * PARAMETROS_MERCADO.volatilidad
    datos.demandaEquipo = demanda
    demandaTotal += demanda
  }

  return demandaTotal
}

// ============================================
// FASE 4: PRECIO DE EQUILIBRIO
// ============================================

function calcularPrecioEquilibrio(demandaTotal: number, ofertaTotal: number): number {
  let precio = PARAMETROS_MERCADO.precioBase
  const ratio = demandaTotal / ofertaTotal

  if (ratio > 1.2) {
    precio *= 1.15 // Escasez: sube 15%
  } else if (ratio < 0.8) {
    precio *= 0.8 // Sobreoferta: baja 20%
  }

  return precio
}

// ============================================
// FASE 5: CALCULAR VENTAS Y FINANCIERO
// ============================================

function calcularFinanciero(
  datosEquipos: Map<string, DatosEquipo>,
  demandaTotal: number,
  ofertaTotal: number,
  precioEquilibrio: number,
  periodo: number
): Map<string, ResultadoPeriodo> {
  const resultados = new Map<string, ResultadoPeriodo>()

  for (const [equipoId, datos] of datosEquipos) {
    // Cuota de mercado
    const cuotaMercado = datos.produccion / ofertaTotal
    const ventasPosibles = demandaTotal * cuotaMercado
    let ventas = Math.min(ventasPosibles, datos.produccion)

    // Inventario
    let inventarioNuevo = datos.inventarioAnterior + datos.produccion - ventas
    const ventasDeInventario = Math.min(
      Math.max(0, ventasPosibles - datos.produccion),
      datos.inventarioAnterior
    )
    ventas += ventasDeInventario
    inventarioNuevo -= ventasDeInventario

    // CÁLCULOS FINANCIEROS
    const ingresos = ventas * precioEquilibrio
    const costos = datos.costos
    const gananciaAntesImpuestos = ingresos - costos

    let impuestos = 0
    if (gananciaAntesImpuestos > 0) {
      impuestos = gananciaAntesImpuestos * PARAMETROS_MERCADO.tasaImpuesto
    }

    const gananciaNet = gananciaAntesImpuestos - impuestos
    let efectivoNuevo = datos.efectivoAnterior + gananciaNet

    // Gestión de deuda
    let deuda = 0
    let efectivoDisponible = efectivoNuevo
    let estado: 'ACTIVA' | 'CRITICA' | 'QUIEBRA' = 'ACTIVA'

    if (efectivoNuevo < 0) {
      const montoDeuda = Math.abs(efectivoNuevo)
      deuda = montoDeuda * (1 + PARAMETROS_MERCADO.tasaInteres)

      if (deuda > 100000) {
        estado = 'QUIEBRA'
        efectivoDisponible = 0
      } else if (deuda > 50000) {
        estado = 'CRITICA'
        efectivoDisponible = 0
      }
    }

    // KPIs
    const margenNeto = ingresos > 0 ? (gananciaNet / ingresos) * 100 : 0
    const roa = gananciaNet / (datos.efectivoAnterior + 1000)
    const indiceDeuda = deuda > 0 ? deuda / ingresos : 0

    const resultado: ResultadoPeriodo = {
      id: '', // Se genera en Firestore
      equipo_id: equipoId,
      competencia_id: '', // Se llena en la función principal
      periodo,
      produccion: Math.round(datos.produccion),
      ingresos: Math.round(ingresos),
      costos_fijos: Math.round(datos.costos * 0.4),
      costos_variables: Math.round(datos.costos * 0.6),
      ganancia_bruta: Math.round(gananciaAntesImpuestos),
      impuestos: Math.round(impuestos),
      ganancia_neta: Math.round(gananciaNet),
      ganancia_acumulada: 0, // Se calcula después
      efectivo: Math.round(efectivoDisponible),
      inventario: Math.round(inventarioNuevo),
      ventas: Math.round(ventas),
      cuota_mercado: Math.round((cuotaMercado * 100) * 10) / 10,
      precio_equilibrio: Math.round(precioEquilibrio * 100) / 100,
      margen_neto: Math.round(margenNeto * 100) / 100,
      roa: Math.round(roa * 10000) / 100,
      indice_deuda: Math.round(indiceDeuda * 10000) / 10000,
      estado,
      evento: undefined,
      timestamp: new Date(),
    }

    resultados.set(equipoId, resultado)
  }

  return resultados
}

// ============================================
// FUNCIÓN PRINCIPAL: SIMULAR PERÍODO
// ============================================

export async function simularPeriodo(
  decisiones: Decision[],
  equipos: any[],
  periodo: number
): Promise<{ resultados: Map<string, ResultadoPeriodo>; evento: Evento | null }> {
  // FASE 1: Procesar decisiones
  const { datosEquipos, ofertaTotal } = procesarDecisiones(decisiones, equipos)

  // FASE 2: Evento de mercado
  const evento = generarEvento()

  // FASE 3: Calcular demanda
  const demandaTotal = calcularDemanda(datosEquipos, evento)

  // FASE 4: Precio de equilibrio
  const precioEquilibrio = calcularPrecioEquilibrio(demandaTotal, ofertaTotal)

  // FASE 5: Calcular ventas y financiero
  const resultados = calcularFinanciero(datosEquipos, demandaTotal, ofertaTotal, precioEquilibrio, periodo)

  // FASE 6: Calcular ganancia acumulada
  // (En una app real, se consulta la BD para los períodos anteriores)
  for (const resultado of resultados.values()) {
    if (periodo === 1) {
      resultado.ganancia_acumulada = resultado.ganancia_neta
    } else {
      // En app real: ganancia_acumulada = ganancia_anterior + ganancia_neta
      resultado.ganancia_acumulada = resultado.ganancia_neta
    }
  }

  return { resultados, evento }
}

// ============================================
// GENERADOR DE LA VOZ (DIARIOS)
// ============================================

export function generarLaVoz(
  periodo: number,
  evento: Evento | null,
  resultadosAnteriores: Map<string, any>
): {
  analisis: string
  eventos: string[]
  cambios_parametros: Record<string, any>
  limites: Record<string, any>
} {
  const eventos: string[] = []
  const cambios_parametros: Record<string, any> = {}

  // Análisis del período anterior
  const analisisEconómico = evento
    ? `Se produjo un evento de mercado importante: "${evento.descripcion}". Esto afectó significativamente la demanda con un multiplicador de ${evento.factor}x.`
    : 'El mercado mostró estabilidad. Demanda y oferta en equilibrio relativo.'

  // Cambios en parámetros (basados en período)
  if (periodo === 2) {
    cambios_parametros['tasa_nacion'] = { antes: '27%', despues: '21%' }
    cambios_parametros['max_credito_nacion'] = { antes: '$85K', despues: '$170K' }
    eventos.push('Banco Nación bajó tasa de interés')
    eventos.push('Nuevas oportunidades de crédito disponibles')
  } else if (periodo === 4) {
    cambios_parametros['impuesto'] = { antes: '30%', despues: '28%' }
    eventos.push('Ajuste fiscal: impuesto reducido')
  } else if (periodo === 6) {
    cambios_parametros['volatilidad'] = { antes: '15%', despues: '20%' }
    eventos.push('Aumento de volatilidad en el mercado')
  }

  // Límites para el siguiente período
  const limites = {
    precio_min: 74,
    precio_max: 100,
    marketing_max: 10000,
    id_max: 10000,
    ampliacion_max: 15000,
    capacitacion_max: 20000,
  }

  return {
    analisis: analisisEconómico,
    eventos,
    cambios_parametros,
    limites,
  }
}
