import { useState, useEffect, useCallback } from 'react'
import { doc, collection, getDocs, addDoc, updateDoc, query, where, orderBy, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { Equipo, Competencia, Decision, ResultadoPeriodo } from '@/types'

// Hook para obtener datos de Firestore
export function useFirestore<T>(
  collectionName: string,
  filters?: Array<{ field: string; operator: any; value: any }>
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const ref = collection(db, collectionName)
        const docs = await getDocs(ref)
        setData(docs.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T)))
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error desconocido'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionName])

  return { data, loading, error }
}

// Hook para obtener el equipo del usuario actual
export function useUsuarioEquipo(userId: string) {
  const [equipo, setEquipo] = useState<Equipo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        setLoading(true)
        const equiposRef = collection(db, 'equipos')
        const docSnap = await getDocs(equiposRef)
        const found = docSnap.docs.find((d) => {
          const data = d.data() as Equipo
          return data.miembros && data.miembros.includes(userId)
        })
        if (found) {
          setEquipo({ id: found.id, ...found.data() } as Equipo)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar equipo'))
      } finally {
        setLoading(false)
      }
    }

    if (userId) fetchEquipo()
  }, [userId])

  return { equipo, loading, error }
}

// Hook para obtener equipo actual del usuario
export function useEquipo(equipoId: string) {
  const [equipo, setEquipo] = useState<Equipo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        setLoading(true)
        const docRef = doc(db, 'equipos', equipoId)
        const docSnap = await getDocs(collection(db, 'equipos'))
        const found = docSnap.docs.find((d) => d.id === equipoId)
        if (found) {
          setEquipo({ id: found.id, ...found.data() } as Equipo)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar equipo'))
      } finally {
        setLoading(false)
      }
    }

    if (equipoId) fetchEquipo()
  }, [equipoId])

  return { equipo, loading, error }
}

// Hook para obtener resultados de un período
export function useResultados(equipoId: string, competenciaId: string, periodo: number) {
  const [resultados, setResultados] = useState<ResultadoPeriodo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        setLoading(true)
        const docSnap = await getDocs(
          query(
            collection(db, 'resultados_periodo'),
            where('equipo_id', '==', equipoId),
            where('competencia_id', '==', competenciaId),
            where('periodo', '==', periodo)
          )
        )

        if (!docSnap.empty) {
          const doc = docSnap.docs[0]
          setResultados({ id: doc.id, ...doc.data() } as ResultadoPeriodo)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar resultados'))
      } finally {
        setLoading(false)
      }
    }

    if (equipoId && competenciaId && periodo) fetchResultados()
  }, [equipoId, competenciaId, periodo])

  return { resultados, loading, error }
}

// Hook para obtener todos los resultados de un equipo (para gráficos)
export function useResultadosEquipo(equipoId: string, competenciaId: string) {
  const [resultados, setResultados] = useState<ResultadoPeriodo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        setLoading(true)
        const docSnap = await getDocs(
          query(
            collection(db, 'resultados_periodo'),
            where('equipo_id', '==', equipoId),
            where('competencia_id', '==', competenciaId),
            orderBy('periodo', 'asc')
          )
        )

        setResultados(docSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ResultadoPeriodo)))
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error al cargar resultados'))
      } finally {
        setLoading(false)
      }
    }

    if (equipoId && competenciaId) fetchResultados()
  }, [equipoId, competenciaId])

  return { resultados, loading, error }
}

// Hook para formato de moneda
export function useFormatCurrency() {
  return useCallback((value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }, [])
}

// Hook para formato de porcentaje
export function useFormatPercent() {
  return useCallback((value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }, [])
}

// Hook para debounce
export function useDebouncedValue<T>(value: T, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}