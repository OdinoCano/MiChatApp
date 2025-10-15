# 🎨 MiChatApp - Luxury Design Guide

## Paleta de Colores

### Colores Principales
- **Negro**: `#000000` - Color principal, elegante y atemporal
- **Dorado**: `#C9A961` - Accent de lujo, utilizado para detalles premium
- **Dorado Claro**: `#E5D4A6` - Variante más suave para highlights

### Backgrounds
- **Blanco Puro**: `#FFFFFF` - Background principal, limpio y sofisticado
- **Gris Claro**: `#F8F8F8` - Background secundario para contraste sutil
- **Negro Profundo**: `#0a0a0a` - Para elementos dark mode (futuro)

### Texto
- **Texto Principal**: `#1a1a1a` - Negro suave para legibilidad
- **Texto Secundario**: `#666666` - Para información complementaria
- **Texto Claro**: `#999999` - Para timestamps y hints
- **Texto Blanco**: `#FFFFFF` - Para textos sobre fondos oscuros

### Mensajes
- **Mensajes Enviados**: `#000000` (Negro elegante)
- **Mensajes Recibidos**: `#F0EDE6` (Beige claro)

### Estados
- **Borde**: `#E5E5E5` - Bordes sutiles
- **Éxito**: `#4CAF50` - Chat activo
- **Error**: `#D32F2F` - Chat cerrado
- **Advertencia**: `#FFA726` - Chat pendiente

## Tipografía

### Jerarquía
- **H1**: 32px, Bold, -0.5px letter-spacing
- **H2**: 24px, Semi-bold, -0.3px letter-spacing
- **H3**: 20px, Semi-bold
- **Body**: 16px, Regular, 24px line-height
- **Small**: 14px, Regular
- **Caption**: 12px, Regular

### Características
- **Letter Spacing**: Amplio en títulos (2-4px) para efecto luxury
- **Font Weight**: Bold (700) para títulos, Regular (400) para cuerpo
- **Text Transform**: UPPERCASE para labels y botones principales

## Componentes

### Botones
- **Primary**: Fondo negro, texto blanco, borde cuadrado (border-radius: 2px)
- **Secondary**: Borde dorado, texto blanco, transparente
- **Shadow**: Sombras sutiles para profundidad (elevation 4-8)

### Inputs
- **Estilo**: Minimalista con borde sutil
- **Border**: 1px, color border
- **Border Radius**: 2px (cuadrado moderno)
- **Padding**: 16px horizontal, 12-16px vertical

### Cards (Chat Items)
- **Background**: Blanco puro
- **Border Left**: 3px dorado (acento distintivo)
- **Border Radius**: 2px
- **Shadow**: Sutil (0, 2, 4, rgba(0,0,0,0.1))
- **Padding**: 20px

### Chat Bubbles
- **Propios**: Negro con texto blanco
- **Recibidos**: Beige claro con texto negro
- **Border Radius**: Asimétrico (12px en 3 esquinas, 2px en la esquina del sender)

### Floating Action Button (FAB)
- **Color**: Dorado (#C9A961)
- **Forma**: Cuadrada (border-radius: 2px)
- **Tamaño**: 64x64px
- **Shadow**: Prominente (elevation 10)

## Principios de Diseño

### 1. Minimalismo Elegante
- Espacios en blanco generosos
- Elementos limpios sin ornamentación excesiva
- Jerarquía visual clara

### 2. Luxury Details
- Colores premium (negro + dorado)
- Letter spacing amplio
- Text transform en UPPERCASE para elementos importantes
- Sombras sutiles pero presentes

### 3. Consistencia
- Border radius consistente (2px para modernidad)
- Padding/Margins en múltiplos de 4 o 8
- Shadows con opacidades consistentes (0.1, 0.2, 0.3)

### 4. Tipografía Premium
- Font weights definidos (400, 600, 700)
- Letter spacing generoso en títulos
- Line height cómodo para legibilidad

## Estructura de Archivos

```
src/
├── theme/
│   ├── colors.ts          # Paleta de colores
│   └── typography.ts      # Estilos tipográficos
├── components/
│   ├── ChatBubble.tsx     # Burbujas de mensajes
│   └── ChatInput.tsx      # Input de mensajes
└── screens/
    ├── LoginScreen.tsx    # Pantalla de login
    ├── ChatListScreen.tsx # Lista de chats
    └── ChatScreen.tsx     # Pantalla de conversación
```

## Mejoras Futuras

1. **Animaciones**: Transiciones suaves entre pantallas
2. **Dark Mode**: Implementar tema oscuro luxury
3. **Custom Fonts**: Integrar fuente premium (ej: Playfair Display, Cormorant)
4. **Gradientes**: Usar gradientes sutiles en headers
5. **Iconos**: Agregar iconos personalizados en lugar de símbolos básicos
6. **Splash Screen**: Pantalla de inicio con logo animado
7. **Loading States**: Skeleton screens con animación shimmer

## Uso del Theme

```typescript
import colors from '../theme/colors';
import { typography } from '../theme/typography';

// En StyleSheet.create():
{
  container: {
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
  }
}
```

## Recursos de Diseño

- **Inspiración**: Marcas de moda luxury (Chanel, Gucci, Dior)
- **Referencia de Colores**: [Coolors.co](https://coolors.co)
- **Iconos**: [Lucide Icons](https://lucide.dev) o [Feather Icons](https://feathericons.com)
- **Fuentes Premium**: Google Fonts (Playfair Display, Cormorant Garamond)

---

**Diseño creado para MiChatApp - Luxury Styling Experience** ✨
