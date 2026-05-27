# 🚀 Simulador Empresarial - Setup Inicial

## Estado del Proyecto

✅ **Inicialización completada**
- Next.js 14 con TypeScript configurado
- Tailwind CSS instalado y configurado
- Firebase + Firestore integrados
- Estructura de carpetas creada
- Autenticación base implementada
- Páginas iniciales creadas

## 📋 Lo que falta por hacer

### Fase 1: Configuración Firebase (Hoy)
- [ ] Crear proyecto en Google Cloud
- [ ] Obtener credenciales Firebase
- [ ] Llenar `.env.local` con credenciales
- [ ] Probar login/signup localmente

### Fase 2: Diseño Juvenil (Esta semana)
- [ ] Crear componentes UI base (Button, Card, Modal)
- [ ] Implementar diseño con gradientes
- [ ] Agregar animaciones smooth
- [ ] Dark mode (opcional)

### Fase 3: Formulario de Decisiones (Próxima semana)
- [ ] Crear formulario 5 tabs
- [ ] Validaciones en tiempo real
- [ ] Conexión a Firestore
- [ ] Vista previa de impacto

### Fase 4: Dashboard + Gráficos (Semanas 3-4)
- [ ] KPI cards funcionales
- [ ] Gráficos con Recharts
- [ ] Tabla de ranking
- [ ] Actualización en tiempo real

### Fase 5: Simulación + Reportes (Semanas 5-6)
- [ ] Algoritmo de simulación
- [ ] Balance General
- [ ] Estado de Resultados
- [ ] Flujo de Caja
- [ ] Panel Admin

## 🔧 Primeros Pasos

### 1. Configurar Firebase

1. Ve a https://firebase.google.com/
2. Click en "Ir a la consola"
3. Crea nuevo proyecto: "simulador-empresarial"
4. Habilita Firestore Database (modo prueba, región Buenos Aires)
5. Habilita Authentication (Email/Password)
6. Project Settings → Tu app web → Copia las credenciales

### 2. Llenar .env.local

Abre `.env.local` y reemplaza los placeholders con tus credenciales:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_clave_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_dominio.firebaseapp.com
# ... resto de credenciales
```

### 3. Ejecutar localmente

```bash
npm run dev
```

Abre http://localhost:3000

### 4. Probar Autenticación

- Click en "Registrarse"
- Crea una cuenta test
- Deberías ver el Dashboard

## 📁 Estructura de Carpetas

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas públicas (login, signup)
│   ├── (dashboard)/       # Rutas protegidas
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Home público
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── auth/             # Componentes autenticación
│   ├── dashboard/        # Componentes dashboard
│   ├── decisiones/       # Formulario decisiones
│   ├── reportes/         # Reportes financieros
│   ├── admin/            # Panel administrador
│   └── ui/               # Componentes base
├── context/              # React Context
│   └── AuthContext.tsx   # Autenticación global
├── lib/                  # Utilidades
│   └── firebase.ts       # Configuración Firebase
├── types/                # TypeScript types
└── styles/               # Estilos adicionales
```

## 🎨 Stack Tecnológico

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + Gradientes personalizados
- **Base de Datos**: Firebase + Firestore
- **Autenticación**: Firebase Auth
- **State Management**: React Context + Zustand (próximo)
- **Gráficos**: Recharts (próximo)
- **Validación**: Zod + React Hook Form (próximo)

## 🚀 Próximos Pasos

1. **Hoy**: Configurar Firebase y probar login
2. **Mañana**: Crear componentes UI base
3. **Esta semana**: Formulario de decisiones
4. **Próxima semana**: Dashboard con gráficos
5. **Semana 3**: Simulación y reportes

## 📚 Documentación

- Plan completo: Ver archivos en `/uploads/`
- Firebase Docs: https://firebase.google.com/docs
- Next.js Docs: https://nextjs.org/docs
- Tailwind Docs: https://tailwindcss.com/docs

## 💡 Tips

- Usa `npm run dev` para desarrollo
- Firestore está en modo prueba (solo desarrollo)
- Las variables `NEXT_PUBLIC_*` se exponen en el frontend (es seguro)
- Las credenciales privadas van solo en `.env.local`

---

**¿Listo para comenzar? 🚀**

Próximo paso: Configurar Firebase y probar login/signup
