#!/bin/bash

echo "🚀 Instalando MiChatApp App..."
echo ""

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado"
    echo "Ejecuta este script desde el directorio MiChatApp"
    exit 1
fi

# Limpiar node_modules y lock files antiguos
echo "🧹 Limpiando instalación anterior..."
rm -rf node_modules pnpm-lock.yaml package-lock.json

# Instalar dependencias
echo "📦 Instalando dependencias..."
if command -v pnpm &> /dev/null; then
    echo "Usando pnpm..."
    pnpm install
elif command -v npm &> /dev/null; then
    echo "Usando npm..."
    npm install
else
    echo "❌ Error: npm o pnpm no encontrado"
    exit 1
fi

echo ""
echo "✅ Instalación completada!"
echo ""
echo "📱 Para ejecutar la app:"
echo ""
echo "  iOS:"
echo "  $ npm run ios"
echo ""
echo "  Android:"
echo "  $ npm run android"
echo ""
echo "⚠️  Asegúrate de que el backend esté corriendo:"
echo "  $ cd ../fashion-me"
echo "  $ php artisan reverb:start"
echo ""
echo "  Y en otra terminal:"
echo "  $ php artisan serve --host=fashion-me.test"
echo ""
