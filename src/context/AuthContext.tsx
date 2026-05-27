'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db } from '@/lib/firebase'
import type { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import type { Usuario } from '@/types'

interface AuthContextType {
  user: (User & Partial<Usuario>) | null | undefined
  loading: boolean
  rol?: 'student' | 'teacher' | 'admin'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, firebaseLoading] = useAuthState(auth)
  const [userData, setUserData] = useState<Partial<Usuario> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserData = async () => {
      if (!firebaseUser) {
        setUserData(null)
        setLoading(false)
        return
      }

      try {
        const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid))
        if (userDoc.exists()) {
          setUserData(userDoc.data() as Partial<Usuario>)
        } else {
          setUserData(null)
        }
      } catch (err) {
        console.error('Error cargando datos del usuario:', err)
        setUserData(null)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [firebaseUser])

  const user = firebaseUser
    ? ({
        ...firebaseUser,
        rol: userData?.rol,
        nombre: userData?.nombre,
      } as User & Partial<Usuario>)
    : null

  return (
    <AuthContext.Provider value={{ user, loading: firebaseLoading || loading, rol: userData?.rol }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
