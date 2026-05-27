# 🚀 ANÁLISIS COMPLETO - SimulArg Proyecto

## 📊 RESUMEN EJECUTIVO

El proyecto es un **simulador empresarial online educativo** basado en AKRON, con:
- ✅ **8 períodos** de competencia (duración configurable)
- ✅ **Simulación automática** de mercado y finanzas
- ✅ **Dashboard en tiempo real** para alumnos y profesores
- ✅ **Generación automática de "Diarios"** (análisis del mercado)
- ✅ **WebSocket** para actualizaciones en vivo
- ✅ **Reportes financieros** automáticos

---

## 🎯 ACTORES Y ROLES

### 1. **Estudiante**
- Toma **8 decisiones** por período (no carga datos)
- Ve dashboard con KPIs
- Accede a reportes financieros propios
- Compite en ranking en vivo

### 2. **Profesor**
- Crea competencias (define parámetros)
- Carga **datos iniciales** de equipos (precargados)
- Procesa períodos (dispara simulación)
- Ve **dashboard admin** con todos los equipos
- Dispara eventos de mercado (opcional)
- Exporta reportes finales

### 3. **Sistema** (Automático)
- Genera "LA VOZ" (diarios) automáticamente
- Ejecuta simulación al cierre de período
- Calcula resultados financieros
- Actualiza ranking en tiempo real
- Envía notificaciones

---

## 📋 LAS 8 DECISIONES QUE TOMAN ALUMNOS

Cada período, estudiantes completan un formulario con 5 tabs:

### **TAB 1: PRODUCCIÓN**
- Cantidad a producir (selector: 25%, 50%, 75%, 100%)
- Inversión I+D: $0-$10,000
- Ampliación planta: $0-$15,000
- Nivel calidad: 0.8x - 1.2x (afecta costo)

### **TAB 2: VENTAS**
- Precio unitario: $74-$100
- (Sistema calcula demanda automáticamente)

### **TAB 3: MARKETING**
- Inversión: $0-$10,000
- (Afecta demanda: cada $1000 = +2% demanda)

### **TAB 4: RRHH**
- Cantidad empleados
- Capacitación: $0-$20,000

### **TAB 5: FINANZAS**
- Crédito Nación: $0-$85,000 (27% interés, baja a 21%)
- Crédito Crediar: $0-$80,000
- Devoluciones: montos

---

## 🔄 FLUJO COMPLETO POR PERÍODO

```
PERÍODO N (ej. Período 3)
│
├─ INICIO (Día 1 de 5)
│  ├─ Sistema publica "LA VOZ - Período 3"
│  │  └─ Contiene: análisis mercado, cambios parámetros, ranking anterior
│  └─ Alumnos leen y analizan
│
├─ TOMA DE DECISIONES (Días 1-4)
│  ├─ Alumnos completan formulario 5 tabs
│  ├─ Sistema valida en tiempo real
│  └─ WebSocket notifica profesor en vivo
│
├─ CIERRE (Día 5, 11:59 PM)
│  └─ Plazo límite de envíos
│
└─ PROCESAMIENTO (Automático, Día 5 noche - Día 6 mañana)
   ├─ Cron job ejecuta simulación
   ├─ Calcula resultados financieros
   ├─ Genera reportes (Balance, P&L, CF)
   ├─ Actualiza ranking
   ├─ Genera "LA VOZ - Período 4"
   ├─ Envía notificaciones por email + WebSocket
   └─ Alumnos ven resultados instantáneamente
```

---

## 🧮 ALGORITMO DE SIMULACIÓN (Fases)

### **FASE 1: PROCESAR DECISIONES**
- Para cada equipo:
  - Validar capital disponible
  - Calcular producción = cantidad × calidad
  - Calcular costos = producción × costo_var + salarios + marketing
  - Calcular demanda base con marketing: base × (1 + marketing/10000 × 0.2)
  - Aplicar inercia: 70% del período anterior

### **FASE 2: EVENTO DE MERCADO**
- 20% probabilidad cada período
- Tipos: Crisis (0.8x), Boom (1.3x), Cambio tecnológico (0.9x), Problema laboral (0.85x)
- Multiplicar demanda por factor del evento

### **FASE 3: PRECIO DE EQUILIBRIO**
- demanda_total vs oferta_total
- Si demanda > oferta × 1.2 → precio sube 15%
- Si demanda < oferta × 0.8 → precio baja 20%

### **FASE 4: CALCULAR VENTAS**
- Cuota mercado = producción / oferta_total
- Ventas = demanda × cuota_mercado (limitado a inventario)

### **FASE 5: FINANCIERO**
- Ingresos = ventas × precio_equilibrio
- Ganancia = ingresos - costos - impuestos (30%)
- Efectivo_nuevo = efectivo_anterior + ganancia
- Si efectivo < 0: endeudamiento o QUIEBRA

### **FASE 6: RANKING**
- Ordenar por ganancia_acumulada DESC
- Asignar posiciones (1-N)

---

## 📊 DATOS QUE PRECARGA EL PROFESOR

### **OPCIÓN A: Todas iguales (más común)**
```
Todos los equipos comienzan con:
- $150,000 efectivo
- Planta 85,000 unidades/año
- 50 empleados
- Precio $91
- Margen de crédito igual
```

### **OPCIÓN B: Diferentes (CSV)**
```
Profesor sube CSV con:
TeamID | Name | Cash | Plant | Employees | Price
1      | Team1| 150K | 85K   | 50        | 91
2      | Team2| 120K | 70K   | 45        | 88
```

---

## 🖥️ GENERACIÓN AUTOMÁTICA DE "LA VOZ"

**¿Qué es?**
Documento generado automáticamente al final de cada período.

**Contenido:**
```
═══════════════════════════════════════════════════
PERÍODO 3 - LA VOZ DEL CERTAMEN
═══════════════════════════════════════════════════

📊 ANÁLISIS PERÍODO 2:
   El mercado mostró sorpresas. Demanda subió 25%.
   Ganancia promedio: $75K

📈 EVENTOS:
   • Demanda subió 25%
   • Nuevas oportunidades de crédito

💰 CAMBIOS PARÁMETROS:
   • Tasa Banco Nación: 27% → 21% (bajó 6%)
   • Máximo crédito: $85K → $170K
   • Tasa mantenimiento: 8% (sin cambios)

⚠️ LÍMITES PERÍODO 3:
   • Precio: $74-$100
   • Marketing: Máximo $10,000
   • I+D: Máximo $10,000

🏆 RANKING PERÍODO 2:
   1. TechVision     $145.2K
   2. InnovaMaxx     $138.7K
   3. EcoSmart       $125.4K
   4. TechGrow Inc   $118.9K
   5. GrowthCorp     $102.3K

💡 CONSEJOS ESTRATÉGICOS:
   El mercado favorece empresas que:
   - Aprovechan demanda alta
   - Invierten en crédito barato
   - Mantienen margen saludable
```

---

## 📱 PANTALLAS PRINCIPALES

### **1. HOME (Público)**
- Landing page
- Login/Signup

### **2. DASHBOARD ALUMNO**
- KPI Cards (Ingresos, Ganancia, Efectivo, Margen)
- Gráficos: Evolución ingresos, Costos vs Ingresos
- Tabla ranking (con highlight del equipo)
- Estado actual: Período, Estado, Efectivo, Deuda

### **3. DECISIONES**
- Formulario 5 tabs interactivos
- Preview de impacto (costo total, ingresos estimados, riesgo)
- Guardar borrador + Enviar decisión

### **4. REPORTES**
- Balance General (tabla)
- Estado de Resultados (tabla)
- Flujo de Caja (tabla + gráfico)
- KPIs detallados

### **5. RANKING**
- Tabla con posición, equipo, ganancia, margen, efectivo
- Actualización en tiempo real (sin refrescar)
- Click para ver comparativa detallada

### **6. DASHBOARD PROFESOR** (Panel Admin)
- Estado de envíos (✓ Enviado, ⏳ Pendiente)
- Ranking en vivo (WebSocket)
- Detalles de cada equipo
- Comparativa entre equipos
- Análisis global del mercado
- Botón "Procesar Período"
- Exportar reportes (PDF, Excel, CSV)
- Auditoría completa

---

## 🔐 ESTRUCTURA DE DATOS (Firestore)

### **Colecciones principales:**

```
competencias/
  ├─ id
  ├─ nombre
  ├─ profesor_id
  ├─ estado: 'preparacion', 'en_curso', 'finalizada'
  ├─ periodo_actual: 1-8
  ├─ fecha_inicio
  ├─ fecha_fin
  ├─ capital_inicial
  └─ equipos: [equipo_ids]

equipos/
  ├─ id
  ├─ nombre
  ├─ competencia_id
  ├─ miembros: [uid]
  ├─ efectivo
  ├─ inventario
  ├─ deuda
  ├─ estado: 'activa', 'critica', 'quiebra'
  ├─ posicion_ranking
  └─ ganancia_acumulada

decisiones/
  ├─ id
  ├─ equipo_id
  ├─ competencia_id
  ├─ periodo
  ├─ produccion (%)
  ├─ id (inversión I+D)
  ├─ ampliacion_planta
  ├─ precio
  ├─ marketing
  ├─ empleados
  ├─ capacitacion
  ├─ credito_nacion
  ├─ credito_crediar
  ├─ timestamp
  └─ estado: 'borrador', 'enviada'

resultados_periodo/
  ├─ id
  ├─ equipo_id
  ├─ competencia_id
  ├─ periodo
  ├─ produccion
  ├─ ingresos
  ├─ costos_totales
  ├─ ganancia_neta
  ├─ ganancia_acumulada
  ├─ margen_neto
  ├─ efectivo
  ├─ inventario
  ├─ ventas
  ├─ cuota_mercado
  ├─ precio_equilibrio
  ├─ estado: 'ACTIVA', 'CRITICA', 'QUIEBRA'
  ├─ evento: tipo de evento si aplica
  └─ timestamp

reportes_financieros/
  ├─ id
  ├─ equipo_id
  ├─ competencia_id
  ├─ periodo
  ├─ balance_general (JSON)
  ├─ estado_resultados (JSON)
  ├─ flujo_caja (JSON)
  ├─ kpis (JSON)
  └─ timestamp

eventos_mercado/
  ├─ id
  ├─ competencia_id
  ├─ periodo
  ├─ tipo: 'crisis', 'boom', 'tech', 'laboral'
  ├─ factor: multiplicador
  ├─ descripcion
  └─ timestamp

la_voz/
  ├─ id
  ├─ competencia_id
  ├─ periodo
  ├─ analisis_anterior
  ├─ eventos_ocurridos
  ├─ cambios_parametros
  ├─ limites_nuevo_periodo
  ├─ ranking_anterior
  ├─ consejos_estrategicos
  └─ timestamp
```

---

## 🔧 STACK TECNOLÓGICO REQUERIDO

### **Frontend (Ya instalado)**
- ✅ Next.js 14 + React 18
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Zustand (state management)
- ✅ React Query (data fetching)
- ✅ Recharts (gráficos)
- ✅ React Hook Form + Zod (validación)

### **Backend (Necesario)**
- ❌ Node.js + Express (o Cloud Functions)
- ❌ WebSocket (Socket.io)
- ❌ PostgreSQL (o Firestore)
- ❌ Redis (caché)
- ❌ Cron jobs (para simulación)

### **Infraestructura**
- ✅ Firebase (Auth + Firestore)
- ❌ SendGrid o Mailgun (email)
- ❌ Sentry (error tracking)
- ❌ AWS o similar (hosting)

---

## 📅 PLAN DE IMPLEMENTACIÓN

### **FASE 1: Configuración Base (ESTA SEMANA)**
- ✅ Setup Next.js + Firebase (YA HECHO)
- [ ] Login/Signup funcional
- [ ] Context de autenticación
- [ ] Estructura Firestore

### **FASE 2: Interfaz Alumno (Semana 1-2)**
- [ ] Dashboard con KPI cards
- [ ] Formulario decisiones (5 tabs)
- [ ] Reportes financieros
- [ ] Ranking en vivo

### **FASE 3: Interfaz Profesor (Semana 2-3)**
- [ ] Crear competencia
- [ ] Panel admin
- [ ] Procesar período
- [ ] Exportar reportes

### **FASE 4: Motor de Simulación (Semana 3-4)**
- [ ] Implementar algoritmo (6 fases)
- [ ] Generación de "LA VOZ"
- [ ] Cálculo de reportes financieros
- [ ] Actualización ranking

### **FASE 5: WebSocket + Tiempo Real (Semana 4)**
- [ ] Actualizaciones en vivo
- [ ] Notificaciones email
- [ ] Push notifications

### **FASE 6: QA + Deploy (Semana 5)**
- [ ] Testing completo
- [ ] Optimización performance
- [ ] Deploy Vercel/Cloud

---

## ⚡ PRÓXIMOS PASOS INMEDIATOS

1. **Confirmar Firebase** credenciales en `.env.local`
2. **Crear colecciones** en Firestore (estructura de datos)
3. **Implementar componentes UI**:
   - KPI Cards
   - Tabs para formulario
   - Tablas para reportes
   - Gráficos Recharts
4. **Crear páginas principales**:
   - Dashboard alumno
   - Página decisiones
   - Página reportes
   - Página ranking
5. **Conectar a Firestore** (lectura/escritura)

¿Continuamos con la implementación? 🚀
