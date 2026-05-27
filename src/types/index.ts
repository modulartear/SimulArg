// Tipos principales del sistema

export interface Usuario {
  uid: string
  email: string
  nombre: string
  rol: 'student' | 'teacher' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface Competencia {
  id: string
  nombre: string
  profesor_id: string
  descripcion?: string
  estado: 'preparacion' | 'en_curso' | 'finalizada'
  periodo_actual: number
  total_periodos: number
  fecha_inicio: Date
  fecha_fin: Date
  capital_inicial: number
  equipos: string[]
  parametros?: CompetenciaParametros
  createdAt: Date
  updatedAt: Date
}

export interface CompetenciaParametros {
  demanda_base: number
  precio_base: number
  tasa_interes: number
  tasa_impuesto: number
  volatilidad: number
}

export interface Equipo {
  id: string
  nombre: string
  competencia_id: string
  profesor_id: string
  miembros: string[]
  efectivo: number
  inventario: number
  deuda: number
  estado: 'activa' | 'critica' | 'quiebra'
  posicion_ranking: number
  ganancia_acumulada: number
  periodo_actual: number
  createdAt: Date
  updatedAt: Date
}

export interface Decision {
  id: string
  equipo_id: string
  competencia_id: string
  periodo: number
  produccion: number // 25, 50, 75, 100 (%)
  calidad: number // 0.8 - 1.2
  id_inversion: number // $0-$10,000
  ampliacion_planta: number // $0-$15,000
  precio: number // $74-$100
  marketing: number // $0-$10,000
  empleados: number
  capacitacion: number // $0-$20,000
  credito_nacion: number // $0-$85,000
  credito_crediar: number // $0-$80,000
  devoluciones: number
  estado: 'borrador' | 'enviada'
  timestamp: Date
}

export interface ResultadoPeriodo {
  id: string
  equipo_id: string
  competencia_id: string
  periodo: number
  produccion: number
  ingresos: number
  costos_fijos: number
  costos_variables: number
  ganancia_bruta: number
  impuestos: number
  ganancia_neta: number
  ganancia_acumulada: number
  efectivo: number
  inventario: number
  ventas: number
  cuota_mercado: number
  precio_equilibrio: number
  margen_neto: number
  roa: number
  indice_deuda: number
  estado: 'ACTIVA' | 'CRITICA' | 'QUIEBRA'
  evento?: string
  timestamp: Date
}

export interface ReporteFinanciero {
  id: string
  equipo_id: string
  competencia_id: string
  periodo: number
  balance_general: BalanceGeneral
  estado_resultados: EstadoResultados
  flujo_caja: FlujoCaja
  kpis: KPIs
  timestamp: Date
}

export interface BalanceGeneral {
  activos: {
    efectivo: number
    inventario: number
    activos_fijos: number
    total: number
  }
  pasivos: {
    deuda_corto_plazo: number
    deuda_largo_plazo: number
    total: number
  }
  patrimonio: {
    capital_inicial: number
    ganancias_acumuladas: number
    total: number
  }
}

export interface EstadoResultados {
  ventas: number
  costo_mercaderia: number
  ganancia_bruta: number
  gastos_operativos: number
  ebitda: number
  impuestos: number
  ganancia_neta: number
}

export interface FlujoCaja {
  efectivo_inicio: number
  ingresos: number
  egresos: number
  flujo_operativo: number
  flujo_financiero: number
  efectivo_final: number
}

export interface KPIs {
  margen_neto: number
  roa: number
  deuda_equity: number
  current_ratio: number
  roic: number
}

export interface EventoMercado {
  id: string
  competencia_id: string
  periodo: number
  tipo: 'crisis' | 'boom' | 'cambio_tec' | 'problema_laboral'
  factor: number
  descripcion: string
  timestamp: Date
}

export interface LaVoz {
  id: string
  competencia_id: string
  periodo: number
  analisis_anterior: string
  eventos_ocurridos: string[]
  cambios_parametros: Record<string, any>
  limites_nuevo_periodo: Record<string, any>
  ranking_anterior: RankingItem[]
  consejos_estrategicos: string[]
  timestamp: Date
}

export interface RankingItem {
  equipo_id: string
  nombre: string
  ganancia_acumulada: number
  ganancia_periodo: number
  margen_neto: number
  efectivo: number
  deuda: number
  posicion: number
  cambio: number // -1, 0, 1
}