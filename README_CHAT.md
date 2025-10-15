# MiChatApp App 💬

Aplicación React Native con WebSocket para chat en tiempo real conectado a Laravel Reverb.

## ⚡ Quick Start

**Lee primero:** [QUICK_START.md](./QUICK_START.md) para instalación rápida.

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd /var/www/html/fashion/MiChatApp

# Opción recomendada: Script automático
chmod +x install-chat.sh
./install-chat.sh

# O manualmente con pnpm
pnpm install

# O manualmente con npm
npm install
```

**Nota:** Las versiones de React Navigation han sido actualizadas a 6.x (las versiones 7.x aún no están disponibles en npm).

### 2. Configurar el backend

Asegúrate de que el servidor Laravel esté corriendo y que Reverb esté activo:

```bash
cd /var/www/html/fashion/fashion-me

# Iniciar Laravel Reverb
php artisan reverb:start

# En otra terminal, iniciar el servidor
php artisan serve --host=fashion-me.test --port=80
```

### 3. Configurar conexión (Opcional)

Si necesitas cambiar la URL del servidor, edita:

```typescript
// src/config/api.ts
export const API_CONFIG = {
  baseURL: 'http://fashion-me.test',
  apiURL: 'http://fashion-me.test/api',
  wsHost: 'fashion-me.test',
  wsPort: 8080,
  wsKey: 'fashion-me-app-key', // Debe coincidir con REVERB_APP_KEY en .env
  useTLS: false,
};
```

### 4. Ejecutar la app

#### iOS
```bash
npm run ios
# O
npx react-native run-ios
```

#### Android
```bash
npm run android
# O
npx react-native run-android
```

## 📱 Características

✅ **Autenticación** con Laravel Sanctum
✅ **WebSocket** en tiempo real con Laravel Reverb
✅ **Chat privado** con autorización por canal
✅ **Mensajes en tiempo real**
✅ **Estados de chat** (Pendiente, Aceptado, Rechazado)
✅ **Marcado de lectura** de mensajes
✅ **UI moderna** con React Native

## 🔧 Estructura del Proyecto

```
MiChatApp/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ChatBubble.tsx   # Burbuja de mensaje
│   │   └── ChatInput.tsx    # Input para enviar mensajes
│   ├── config/
│   │   └── api.ts           # Configuración de API y WebSocket
│   ├── screens/             # Pantallas principales
│   │   ├── LoginScreen.tsx
│   │   ├── ChatListScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── services/            # Servicios
│   │   ├── api.ts           # Cliente HTTP (Axios)
│   │   └── websocket.ts     # Cliente WebSocket (Laravel Echo)
│   └── types/
│       └── chat.ts          # Tipos TypeScript
└── App.tsx                  # Punto de entrada con navegación
```

## 🔌 Eventos WebSocket

La app escucha los siguientes eventos en el canal privado `chat.{uid}`:

### ChatMessageCreated
```typescript
{
  type: 'message',
  chat_id: number,
  chat_uid: string,
  message_id: number,
  body: string,
  sender: { id, name, email },
  created_at: string
}
```

### ChatStatusUpdated
```typescript
{
  type: 'status',
  chat_id: number,
  chat_uid: string,
  status: 'pending' | 'accepted' | 'rejected',
  accepted_at: string | null,
  rejected_at: string | null,
  assessor: User | null,
  client: User
}
```

### ChatMessageRead
```typescript
{
  type: 'read',
  message_id: number,
  chat_id: number,
  chat_uid: string,
  read_at: string
}
```

## 🔐 API Endpoints

### Autenticación
- `POST /api/login` - Iniciar sesión
- `POST /api/logout` - Cerrar sesión
- `GET /api/user` - Obtener usuario actual

### Chats
- `GET /api/chats` - Listar chats
- `GET /api/chats/{id}` - Obtener un chat
- `POST /api/chats` - Crear chat

### Mensajes
- `POST /api/chats/{id}/messages` - Enviar mensaje
- `PATCH /api/chats/{id}/messages/{messageId}/read` - Marcar como leído

## 🐛 Troubleshooting

### WebSocket no conecta

1. Verifica que Laravel Reverb esté corriendo:
   ```bash
   php artisan reverb:start
   ```

2. Verifica la configuración en `.env`:
   ```env
   BROADCAST_DRIVER=reverb
   REVERB_APP_ID=your-app-id
   REVERB_APP_KEY=fashion-me-app-key
   REVERB_APP_SECRET=your-secret
   REVERB_HOST=fashion-me.test
   REVERB_PORT=8080
   REVERB_SCHEME=http
   ```

3. Asegúrate de que el firewall permita el puerto 8080

### Error de autenticación en canal privado

Verifica que el token Bearer se esté enviando correctamente en el header `Authorization`.

### La app no puede conectarse al servidor

- En Android: usa la IP de tu máquina en lugar de `localhost`
- En iOS simulador: `localhost` debería funcionar
- Verifica que `fashion-me.test` esté en tu archivo `/etc/hosts`

## 📚 Tecnologías Utilizadas

- **React Native** - Framework móvil
- **TypeScript** - Tipado estático
- **React Navigation** - Navegación
- **Axios** - Cliente HTTP
- **Laravel Echo** - Cliente WebSocket
- **Pusher JS** - Protocolo WebSocket
- **Laravel Reverb** - Servidor WebSocket (backend)

## 👨‍💻 Desarrollo

Para desarrollo, puedes usar credenciales de prueba que existan en tu base de datos de Laravel.

```typescript
// Ejemplo de login
email: 'admin@fashion-me.test'
password: 'password'
```

---

**Nota:** Esta app se conecta a `http://fashion-me.test/` - asegúrate de que el backend esté corriendo en esa URL.
