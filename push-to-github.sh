#!/bin/bash
# Script para hacer push de todos los cambios a GitHub
# Ejecuta este script en tu máquina local (NO en el servidor remoto)

echo "📤 Preparando para hacer push a GitHub..."
echo ""

# Paso 1: Configurar el remote
echo "1️⃣  Configurando remote origin..."
git remote set-url origin https://github.com/modulartear/SimulArg.git

# Paso 2: Hacer fetch de la rama remota
echo "2️⃣  Descargando información del repositorio remoto..."
git fetch origin

# Paso 3: Hacer push de la rama
echo "3️⃣  Haciendo push de claude/sweet-curie-26LCi a GitHub..."
git push -u origin claude/sweet-curie-26LCi

echo ""
echo "✅ ¡Push completado!"
echo ""
echo "📊 Commits que se subieron:"
git log --oneline origin/main..claude/sweet-curie-26LCi | head -15

echo ""
echo "🔗 Tu rama está disponible en:"
echo "https://github.com/modulartear/SimulArg/tree/claude/sweet-curie-26LCi"
