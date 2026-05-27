import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from './firebase'
import type {
  Competencia,
  Equipo,
  Decision,
  ResultadoPeriodo,
  ReporteFinanciero,
  LaVoz,
  Usuario,
} from '@/types'

// ============================================
// USUARIOS
// ============================================

export async function guardarUsuario(uid: string, userData: Partial<Usuario>) {
  try {
    await setDoc(doc(db, 'usuarios', uid), {
      uid,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error guardando usuario:', error)
    throw error
  }
}

export async function getUsuario(uid: string): Promise<Usuario | null> {
  try {
    const docSnap = await getDoc(doc(db, 'usuarios', uid))
    return docSnap.exists() ? (docSnap.data() as Usuario) : null
  } catch (error) {
    console.error('Error obteniendo usuario:', error)
    return null
  }
}

// ============================================
// COMPETENCIAS
// ============================================

export async function crearCompetencia(competencia: Omit<Competencia, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'competencias'), {
      ...competencia,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando competencia:', error)
    throw error
  }
}

export async function getCompetencias(profesorId: string): Promise<Competencia[]> {
  try {
    const q = query(collection(db, 'competencias'), where('profesor_id', '==', profesorId))
    const docs = await getDocs(q)
    return docs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Competencia))
  } catch (error) {
    console.error('Error obteniendo competencias:', error)
    return []
  }
}

export async function getCompetencia(id: string): Promise<Competencia | null> {
  try {
    const docSnap = await getDoc(doc(db, 'competencias', id))
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Competencia) : null
  } catch (error) {
    console.error('Error obteniendo competencia:', error)
    return null
  }
}

// ============================================
// EQUIPOS
// ============================================

export async function crearEquipo(equipo: Omit<Equipo, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'equipos'), {
      ...equipo,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error creando equipo:', error)
    throw error
  }
}

export async function getEquiposCompetencia(competenciaId: string): Promise<Equipo[]> {
  try {
    const q = query(collection(db, 'equipos'), where('competencia_id', '==', competenciaId))
    const docs = await getDocs(q)
    return docs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Equipo))
  } catch (error) {
    console.error('Error obteniendo equipos:', error)
    return []
  }
}

export async function getEquipo(id: string): Promise<Equipo | null> {
  try {
    const docSnap = await getDoc(doc(db, 'equipos', id))
    return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Equipo) : null
  } catch (error) {
    console.error('Error obteniendo equipo:', error)
    return null
  }
}

export async function actualizarEquipo(id: string, updates: Partial<Equipo>) {
  try {
    await updateDoc(doc(db, 'equipos', id), {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error actualizando equipo:', error)
    throw error
  }
}

// ============================================
// DECISIONES
// ============================================

export async function guardarDecision(decision: Omit<Decision, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'decisiones'), {
      ...decision,
      timestamp: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error guardando decisión:', error)
    throw error
  }
}

export async function getDecisionesPeriodo(
  competenciaId: string,
  periodo: number
): Promise<Decision[]> {
  try {
    const q = query(
      collection(db, 'decisiones'),
      where('competencia_id', '==', competenciaId),
      where('periodo', '==', periodo)
    )
    const docs = await getDocs(q)
    return docs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Decision))
  } catch (error) {
    console.error('Error obteniendo decisiones:', error)
    return []
  }
}

export async function getDecisionEquipoPeriodo(
  equipoId: string,
  competenciaId: string,
  periodo: number
): Promise<Decision | null> {
  try {
    const q = query(
      collection(db, 'decisiones'),
      where('equipo_id', '==', equipoId),
      where('competencia_id', '==', competenciaId),
      where('periodo', '==', periodo)
    )
    const docs = await getDocs(q)
    return docs.docs.length > 0 ? ({ id: docs.docs[0].id, ...docs.docs[0].data() } as Decision) : null
  } catch (error) {
    console.error('Error obteniendo decisión:', error)
    return null
  }
}

// ============================================
// RESULTADOS
// ============================================

export async function guardarResultado(resultado: Omit<ResultadoPeriodo, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'resultados_periodo'), {
      ...resultado,
      timestamp: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error guardando resultado:', error)
    throw error
  }
}

export async function getResultadoEquipoPeriodo(
  equipoId: string,
  competenciaId: string,
  periodo: number
): Promise<ResultadoPeriodo | null> {
  try {
    const q = query(
      collection(db, 'resultados_periodo'),
      where('equipo_id', '==', equipoId),
      where('competencia_id', '==', competenciaId),
      where('periodo', '==', periodo)
    )
    const docs = await getDocs(q)
    return docs.docs.length > 0
      ? ({ id: docs.docs[0].id, ...docs.docs[0].data() } as ResultadoPeriodo)
      : null
  } catch (error) {
    console.error('Error obteniendo resultado:', error)
    return null
  }
}

export async function getResultadosEquipo(
  equipoId: string,
  competenciaId: string
): Promise<ResultadoPeriodo[]> {
  try {
    const q = query(
      collection(db, 'resultados_periodo'),
      where('equipo_id', '==', equipoId),
      where('competencia_id', '==', competenciaId),
      orderBy('periodo', 'asc')
    )
    const docs = await getDocs(q)
    return docs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ResultadoPeriodo))
  } catch (error) {
    console.error('Error obteniendo resultados:', error)
    return []
  }
}

export async function getRankingCompetencia(competenciaId: string): Promise<ResultadoPeriodo[]> {
  try {
    const q = query(
      collection(db, 'resultados_periodo'),
      where('competencia_id', '==', competenciaId),
      orderBy('ganancia_acumulada', 'desc'),
      limit(10)
    )
    const docs = await getDocs(q)
    return docs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ResultadoPeriodo))
  } catch (error) {
    console.error('Error obteniendo ranking:', error)
    return []
  }
}

// ============================================
// REPORTES
// ============================================

export async function guardarReporte(reporte: Omit<ReporteFinanciero, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'reportes_financieros'), {
      ...reporte,
      timestamp: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error guardando reporte:', error)
    throw error
  }
}

export async function getReporteEquipoPeriodo(
  equipoId: string,
  competenciaId: string,
  periodo: number
): Promise<ReporteFinanciero | null> {
  try {
    const q = query(
      collection(db, 'reportes_financieros'),
      where('equipo_id', '==', equipoId),
      where('competencia_id', '==', competenciaId),
      where('periodo', '==', periodo)
    )
    const docs = await getDocs(q)
    return docs.docs.length > 0
      ? ({ id: docs.docs[0].id, ...docs.docs[0].data() } as ReporteFinanciero)
      : null
  } catch (error) {
    console.error('Error obteniendo reporte:', error)
    return null
  }
}

// ============================================
// LA VOZ (DIARIOS)
// ============================================

export async function guardarLaVoz(laVoz: Omit<LaVoz, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'la_voz'), {
      ...laVoz,
      timestamp: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error('Error guardando LA VOZ:', error)
    throw error
  }
}

export async function getLaVoz(competenciaId: string, periodo: number): Promise<LaVoz | null> {
  try {
    const q = query(
      collection(db, 'la_voz'),
      where('competencia_id', '==', competenciaId),
      where('periodo', '==', periodo)
    )
    const docs = await getDocs(q)
    return docs.docs.length > 0 ? ({ id: docs.docs[0].id, ...docs.docs[0].data() } as LaVoz) : null
  } catch (error) {
    console.error('Error obteniendo LA VOZ:', error)
    return null
  }
}
