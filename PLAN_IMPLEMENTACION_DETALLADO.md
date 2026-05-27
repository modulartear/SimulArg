# 📋 PLAN DE IMPLEMENTACIÓN DETALLADO

## SEMANA 1: Configuración Base + UI Componentes

### Día 1-2: Firestore Setup + Componentes Base

**Tareas:**

1. ✅ **Crear estructura Firestore** (9 colecciones)
   - `competencias`, `equipos`, `decisiones`, `resultados_periodo`
   - `reportes_financieros`, `eventos_mercado`, `la_voz`, `usuarios`, `logs`

2. **Crear componentes reutilizables** (`src/components/ui/`)
   - `KPICard.tsx` - Tarjeta con métrica + delta
   - `Chart.tsx` - Wrapper de Recharts
   - `DataTable.tsx` - Tabla responsive
   - `Form.tsx` - Formulario base
   - `Tabs.tsx` - Sistema de tabs
   - `Modal.tsx` - Modal genérico
   - `Button.tsx` - Botón estilizado
   - `Input.tsx` - Input validado

3. **Crear custom hooks** (`src/lib/hooks.ts`)
   - `useFirestore()` - Lectura/escritura Firestore
   - `usePagination()` - Paginación
   - `useLocalStorage()` - Persistencia local
   - `useDebouncedValue()` - Debounce

4. **Crear tipos TypeScript** (`src/types/`)
   - `Competencia.ts`
   - `Equipo.ts`
   - `Decision.ts`
   - `Resultado.ts`
   - `Usuario.ts`

### Día 3-5: Dashboard Alumno Básico

**Tareas:**

1. **Dashboard principal** (`src/app/(dashboard)/dashboard/page.tsx`)
   - KPI Cards (Ingresos, Ganancia, Efectivo, Margen)
   - Gráfico evolución ingresos (Recharts LineChart)
   - Tabla ranking (top 5)
   - Estado actual del período

2. **Página Decisiones** (`src/app/(dashboard)/decisiones/page.tsx`)
   - Formulario con 5 tabs
   - Vista previa de impacto
   - Validaciones en tiempo real
   - Guardar borrador + Enviar

3. **Página Reportes** (`src/app/(dashboard)/reportes/page.tsx`)
   - Balance General (tabla)
   - Estado de Resultados (tabla)
   - Flujo de Caja (tabla + gráfico)
   - Selector de período

4. **Página Ranking** (`src/app/(dashboard)/ranking/page.tsx`)
   - Tabla con datos en vivo
   - Highlight del equipo del usuario
   - Comparativa simple

---

## SEMANA 2: Funcionalidad Profesor + Gestión Datos

### Día 1-3: Dashboard Profesor

**Tareas:**

1. **Crear carpeta profesor** (`src/app/(dashboard)/profesor/`)
   - `page.tsx` - Dashboard principal profesor
   - `crear-competencia.tsx` - Form para crear competencia
   - `ver-equipos.tsx` - Listar equipos de competencia
   - `ver-resultados.tsx` - Resultados en vivo

2. **Panel de Control Profesor**
   - Estado de envíos (✓ Enviado, ⏳ Pendiente)
   - Botón "Procesar Período"
   - Exportar reportes (PDF/Excel)
   - Auditoría de decisiones
   - Disparar eventos de mercado

3. **Comparativa entre equipos**
   - Tabla comparativa: ganancia, margen, efectivo, deuda
   - Gráficos comparativos
   - Análisis de mercado global

### Día 4-5: Integración Firestore + Lógica de Datos

**Tareas:**

1. **Funciones Firebase** (`src/lib/db.ts`)
   - `getCompetencias()` - Obtener competencias del profesor
   - `crearCompetencia()` - Crear nueva competencia
   - `getEquipos()` - Obtener equipos de competencia
   - `getDecisiones()` - Obtener decisiones de período
   - `guardarDecision()` - Guardar decisión alumno
   - `getResultados()` - Obtener resultados calculados
   - `getReportes()` - Obtener reportes financieros

2. **Lógica de validación** (`src/lib/validation.ts`)
   - Validar decisiones vs efectivo disponible
   - Validar límites de parámetros
   - Validar capital mínimo

3. **Utilidades de cálculo** (`src/lib/calculations.ts`)
   - `calcularCostosProduccion()`
   - `calcularCostosLaborales()`
   - `calcularCostosMarketing()`
   - `calcularIngresosPotenciales()`
   - `calcularMargen()`

---

## SEMANA 3: Algoritmo de Simulación

### Día 1-5: Implementar motor de simulación

**Tareas:**

1. **Crear función principal simulación** (`src/lib/simulation.ts`)
   ```typescript
   async function simularPeriodo(competencia_id: string, periodo: number)
   ```

2. **Implementar 6 fases:**
   - Fase 1: Procesar decisiones
   - Fase 2: Evento de mercado (20% probabilidad)
   - Fase 3: Calcular demanda
   - Fase 4: Precio de equilibrio
   - Fase 5: Calcular ventas y financiero
   - Fase 6: Actualizar ranking

3. **Generador de "LA VOZ"** (`src/lib/diario.ts`)
   - Analizar período anterior
   - Describir eventos ocurridos
   - Listar cambios de parámetros
   - Publicar ranking
   - Dar consejos estratégicos

4. **Generador de reportes financieros** (`src/lib/reportes.ts`)
   - `generarBalanceGeneral()`
   - `generarEstadoResultados()`
   - `generarFlujoCaja()`
   - `calcularKPIs()`

5. **Función cron (manual por ahora)** (`src/pages/api/cron/procesar-periodo.ts`)
   - Endpoint para disparar simulación manualmente
   - Validaciones de seguridad
   - Logging de errores

---

## SEMANA 4: WebSocket + Tiempo Real (Opcional para MVP)

### Día 1-3: Implementar Socket.io

**Tareas:**

1. **Setup Socket.io backend** (necesita servidor Node.js)
   - Servidor Node.js + Express
   - Configurar Socket.io
   - Salas por equipo y competencia

2. **Eventos WebSocket**
   - `decision_submitted` - Alumno envía decisión
   - `period_closed` - Periodo cerrado
   - `results_ready` - Resultados listos
   - `ranking_updated` - Ranking actualizado
   - `market_event` - Evento de mercado

3. **Integración cliente** (`src/lib/websocket.ts`)
   - Hook `useWebSocket()`
   - Conectar al servidor Socket.io
   - Escuchar eventos en tiempo real
   - Actualizar estado React

### Día 4-5: Email + Notificaciones

**Tareas:**

1. **Integración SendGrid** (o Mailgun)
   - Email de confirmación decisión
   - Email de resultados período
   - Email de notificaciones

2. **Templates email**
   - `decision-submitted.html`
   - `period-results.html`
   - `ranking-update.html`

---

## 🎯 CHECKLIST POR FASE

### Fase 1: Configuración (Esta semana)
- [x] Firebase configurado
- [ ] Firestore colecciones creadas
- [ ] Componentes UI base creados
- [ ] Custom hooks implementados
- [ ] Tipos TypeScript definidos

### Fase 2: Dashboard Alumno (Semana 1-2)
- [ ] Dashboard con KPIs
- [ ] Gráficos funcionando
- [ ] Tabla ranking funcional
- [ ] Formulario decisiones completo
- [ ] Reportes financieros
- [ ] Página ranking

### Fase 3: Dashboard Profesor (Semana 2-3)
- [ ] Crear competencia funcional
- [ ] Ver equipos y decisiones
- [ ] Panel estado en vivo
- [ ] Exportar reportes
- [ ] Ver auditoría

### Fase 4: Motor Simulación (Semana 3)
- [ ] Algoritmo 6 fases implementado
- [ ] Generador LA VOZ funcional
- [ ] Reportes financieros generados
- [ ] Ranking calculado
- [ ] Endpoint cron funcionando

### Fase 5: WebSocket (Semana 4 - Opcional)
- [ ] Socket.io servidor
- [ ] Socket.io cliente
- [ ] Eventos WebSocket
- [ ] Email integrado
- [ ] Notificaciones

### Fase 6: QA + Deploy (Semana 5)
- [ ] Testing funcional
- [ ] Optimización performance
- [ ] Security review
- [ ] Deploy Vercel
- [ ] Documentación

---

## 📝 ARCHIVO SIGUIENTE

Próximo paso: Crear componentes UI base y estructura Firestore.

¿Empezamos con los componentes? 🚀
