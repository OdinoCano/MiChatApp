# 🚀 Quick Start - Instalación Rápida

## Problema Resuelto ✅

Las versiones de `@react-navigation` en el `package.json` original no existían. He actualizado a versiones compatibles:

- ❌ `@react-navigation/native@^7.3.3` (no existe)
- ✅ `@react-navigation/native@^6.1.18` (instalada)

- ❌ `@react-navigation/native-stack@^7.3.1` (no existe)  
- ✅ `@react-navigation/native-stack@^6.11.0` (instalada)

## Instalación en 3 Pasos

### 1️⃣ Limpiar e Instalar Dependencias

```bash
cd /var/www/html/fashion/MiChatApp

# Opción A: Script automático (recomendado)
chmod +x install-chat.sh
./install-chat.sh

# Opción B: Manual con pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Opción C: Manual con npm
rm -rf node_modules package-lock.json
npm install
```

### 2️⃣ Iniciar Backend Laravel

**Terminal 1 - Reverb WebSocket:**
```bash
cd /var/www/html/fashion/fashion-me
php artisan reverb:start
```

**Terminal 2 - Laravel Server:**
```bash
cd /var/www/html/fashion/fashion-me
php artisan serve --host=fashion-me.test
```

### 3️⃣ Ejecutar App Móvil

**iOS:**
```bash
cd /var/www/html/fashion/MiChatApp
npm run ios
```

**Android:**
```bash
cd /var/www/html/fashion/MiChatApp
npm run android
```

## ⚠️ Configuración para Android

Si usas Android, necesitas usar la IP local en lugar de `fashion-me.test`:

1. **Encuentra tu IP:**
   ```bash
   # Linux/Mac
   ifconfig | grep "inet "
   
   # Windows
   ipconfig
   ```

2. **Actualiza la configuración:**
   
   Edita `src/config/api.ts`:
   ```typescript
   export const API_CONFIG = {
     baseURL: 'http://192.168.1.X',      // Tu IP
     apiURL: 'http://192.168.1.X/api',
     wsHost: '192.168.1.X',              // Tu IP
     wsPort: 8080,
     wsKey: 'fashion-me-app-key',
     useTLS: false,
   };
   ```

3. **Verifica que Laravel escuche en todas las interfaces:**
   ```bash
   php artisan serve --host=0.0.0.0 --port=80
   ```

## 📱 Credenciales de Prueba

Usa cualquier usuario existente en tu base de datos:

```
Email: tu-email@ejemplo.com
Password: tu-password
```

## 🔍 Verificar que Todo Funciona

### 1. Verificar Reverb está corriendo:
```bash
curl http://fashion-me.test:8080/app/fashion-me-app-key
```

### 2. Verificar API:
```bash
curl http://fashion-me.test/api/user \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Logs en tiempo real:
```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Reverb logs (ya visible en la terminal donde corre)
```

## 🐛 Solución de Problemas Comunes

### Error: "No matching version found for @react-navigation"
✅ **Resuelto** - Las versiones ya están corregidas en `package.json`

### Advertencia: "unmet peer eslint@^8.1.0: found 9.37.0"
⚠️ **No crítico** - ESLint 9.x funciona pero algunos plugins esperan v8.x

**¿Afecta mi app?** NO - La app funciona perfectamente.

**¿Debo preocuparme?** Solo si usas `npm run lint` activamente.

**Solución si tienes problemas con linting:**
```bash
pnpm add -D eslint@^8.57.1
```

### Error: "Connection refused" al WebSocket
```bash
# Verifica que Reverb esté corriendo
php artisan reverb:start
```

### Error: "Unable to resolve module"
```bash
# Limpia caché de Metro
npm start -- --reset-cache

# O reinstala
rm -rf node_modules
pnpm install
```

### La app no puede conectarse al servidor (Android)
1. Usa la IP de tu computadora, no `localhost`
2. Verifica que ambos dispositivos estén en la misma red WiFi
3. Desactiva el firewall temporalmente para probar

### Error: "Unauthorized" en WebSocket
- El token no se está enviando correctamente
- Verifica que iniciaste sesión correctamente en la app
- Revisa que `REVERB_APP_KEY` en `.env` coincida con `wsKey` en `api.ts`

## 📚 Documentación Completa

- **README_CHAT.md** - Documentación completa de la app
- **BACKEND_CONFIG.md** - Configuración detallada del backend
- **install-chat.sh** - Script de instalación automática

## 🎯 Resultado Esperado

1. ✅ Login exitoso desde la app móvil
2. ✅ Lista de chats cargada
3. ✅ Mensajes enviados y recibidos en tiempo real
4. ✅ Indicadores de lectura funcionando
5. ✅ Estados del chat actualizándose automáticamente

---

**¿Listo?** Ejecuta `./install-chat.sh` y comienza a chatear! 💬
