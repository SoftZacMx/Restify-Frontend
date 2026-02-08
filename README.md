# Restify Frontend

Frontend del sistema Restify - Sistema de Gestión de Restaurante

## 🚀 Stack Tecnológico

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Data fetching y cache
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Estilos
- **Shadcn/ui** - Componentes UI
- **Zod** - Validación
- **React Hook Form** - Manejo de formularios

## 📦 Instalación

```bash
npm install
```

## 🔧 Configuración

1. Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Configura la URL de la API en `.env`:
```
VITE_API_BASE_URL=http://localhost:3000
```

## 🏃 Desarrollo

```bash
npm run dev
```

El servidor de desarrollo estará disponible en `http://localhost:5173`

## 🏗️ Build

```bash
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── api/              # Cliente API y servicios
├── components/       # Componentes React
│   ├── ui/          # Componentes UI (Shadcn/ui)
│   ├── layout/      # Componentes de layout
│   └── features/    # Componentes por feature
├── pages/           # Páginas/rutas
├── hooks/           # Custom hooks
├── lib/             # Utilidades y configuraciones
├── store/           # Zustand stores
├── types/           # TypeScript types
├── utils/           # Funciones utilitarias
└── contexts/        # React contexts
```

## 🎨 Componentes UI

Los componentes de Shadcn/ui se instalarán en `src/components/ui/`

Para instalar un componente:
```bash
npx shadcn-ui@latest add button
```

## 📝 Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run lint` - Ejecuta ESLint
- `npm run test` - Tests unitarios (Vitest, modo watch)
- `npm run test:run` - Tests unitarios (una ejecución)
- `npm run test:coverage` - Tests con cobertura
- `npm run test:e2e` - Tests E2E (Playwright). Requiere backend para el flujo de login completo.
- `npm run test:e2e:ui` - Tests E2E con interfaz de Playwright
