import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`)
  }
  return value
}

export function getAdminDb() {
  if (getApps().length === 0) {
    const projectId = requireEnv('FIREBASE_ADMIN_PROJECT_ID')
    const clientEmail = requireEnv('FIREBASE_ADMIN_CLIENT_EMAIL')
    const privateKey = requireEnv('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n')

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  }

  return getFirestore()
}

