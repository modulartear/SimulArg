# 📥 Guía para Descargar el Proyecto en tu PC Windows

## Opción 1: Clonar desde GitHub (RECOMENDADO)

### Paso 1: Abre PowerShell o CMD en Windows
```powershell
# Navega a tu carpeta de escritorio
cd C:\Users\usuario\OneDrive\Desktop
```

### Paso 2: Clona el repositorio
```powershell
git clone https://github.com/modulartear/SimulArg.git
cd SimulArg
```

### Paso 3: Descarga los cambios de la rama
```powershell
# Fetch para obtener todas las ramas
git fetch origin

# Cambiar a la rama con todos los cambios nuevos
git checkout claude/sweet-curie-26LCi
```

### Paso 4: Instala dependencias
```powershell
npm install
```

### Paso 5: Inicia el servidor de desarrollo
```powershell
npm run dev
```

Abrirá en: http://localhost:3000

---

## Opción 2: Si ya tienes clonado el repositorio

### Paso 1: Actualiza el repositorio
```powershell
cd C:\Users\usuario\OneDrive\Desktop\SimulArg
git fetch origin
```

### Paso 2: Descarga la rama con los cambios
```powershell
git checkout claude/sweet-curie-26LCi
```

### Paso 3: Instala/actualiza dependencias
```powershell
npm install
```

### Paso 4: Inicia el proyecto
```powershell
npm run dev
```

---

## 📋 Alternativas para Descargar

### Opción A: Descargar ZIP desde GitHub
1. Ve a: https://github.com/modulartear/SimulArg
2. Click en "Code" (botón verde)
3. Click en "Download ZIP"
4. Extrae en: `C:\Users\usuario\OneDrive\Desktop\`

**Pero NECESITARÁS hacer push manualmente después**

### Opción B: Crear desde cero
Si prefieres empezar de cero:

```powershell
# Crear carpeta
cd C:\Users\usuario\OneDrive\Desktop
mkdir SimulArg
cd SimulArg

# Iniciar git
git init

# Agregar remote
git remote add origin https://github.com/modulartear/SimulArg.git

# Descargar todos los cambios
git fetch origin claude/sweet-curie-26LCi

# Crear rama local desde la remota
git checkout -b claude/sweet-curie-26LCi origin/claude/sweet-curie-26LCi

# Instalar dependencias
npm install

# Iniciar
npm run dev
```

---

## 🎯 Lo que obtendrás

Una vez completados los pasos:

✅ Carpeta completa en: `C:\Users\usuario\OneDrive\Desktop\SimulArg`

✅ Estructura del proyecto:
```
SimulArg/
├── src/
│   ├── app/              (Páginas Next.js)
│   ├── components/       (Componentes React)
│   ├── context/          (Context API)
│   ├── lib/              (Funciones helpers)
│   │   ├── firebase.ts   (Config Firebase)
│   │   ├── db.ts         (Funciones Firestore)
│   │   ├── simulation.ts (Motor de simulación)
│   │   └── hooks.ts      (Custom hooks)
│   └── types/            (Tipos TypeScript)
├── node_modules/         (Dependencias)
├── .git/                 (Repositorio git)
├── package.json
├── tsconfig.json
└── ...otros archivos
```

✅ Todos los cambios del proyecto:
- Dashboard conectado a Firestore
- Decisiones guardadas en Firestore
- API de simulación de períodos
- Dashboard del profesor
- Reportes financieros reales
- Ranking en vivo
- LA VOZ (análisis de mercado)

---

## 🔧 Próximos Pasos en tu PC

### 1. Configurar Firebase (IMPORTANTE)
```powershell
# Editar archivo de configuración
# src/lib/firebase.ts
# Agregar tus credenciales de Firebase
```

### 2. Hacer Push a GitHub
```powershell
# Una vez tengas todo funcionando localmente
git push -u origin claude/sweet-curie-26LCi
```

### 3. Instalar dependencias de desarrollo (opcional)
```powershell
npm install --save-dev jest @testing-library/react
```

---

## 🚨 Requisitos Previos

- Node.js 18+ instalado
- Git instalado
- Cuenta de GitHub (para clonar)
- Cuenta de Firebase (para autenticación)

---

## ❓ Solución de Problemas

### Error: "git: command not found"
Instala Git desde: https://git-scm.com/

### Error: "npm: command not found"
Instala Node.js desde: https://nodejs.org/

### Error: "port 3000 already in use"
```powershell
# Usa otro puerto
npm run dev -- -p 3001
```

### Error al conectar con Firebase
Verifica que la configuración en `src/lib/firebase.ts` sea correcta

---

## 📞 Comandos Útiles

```powershell
# Ver estado del repositorio
git status

# Ver commits
git log --oneline | head -15

# Ver cambios no guardados
git diff

# Crear nuevo commit
git add .
git commit -m "tu mensaje"

# Hacer push
git push origin claude/sweet-curie-26LCi

# Hacer pull de cambios remotos
git pull origin claude/sweet-curie-26LCi
```

---

**¡Ahora tienes todo listo en tu máquina local! 🎉**

Para cualquier duda, consulta la documentación en:
- `CAMBIOS-LISTOS-PARA-PUSH.md` - Detalle de cambios
- `ESTADO_DIA_3.md` - Progreso del proyecto
- `ESTADO_DIA_2.md` - Documentación previa
