# Estructura del Proyecto - Restify Frontend

## 📁 Estructura de Carpetas

```
src/
├── domain/                    # Capa de Dominio
│   ├── entities/             # Entidades de negocio
│   │   └── User.entity.ts
│   ├── interfaces/           # Contratos/interfaces
│   │   └── auth.interface.ts
│   ├── types/                # Tipos TypeScript
│   │   └── index.ts
│   └── index.ts              # Barrel export
│
├── application/              # Capa de Aplicación
│   ├── use-cases/            # Casos de uso (futuro)
│   └── services/             # Servicios de aplicación
│       ├── auth.service.ts
│       └── index.ts
│
├── infrastructure/           # Capa de Infraestructura
│   ├── api/                  # Cliente API y repositorios
│   │   ├── client.ts        # Cliente HTTP configurado
│   │   ├── repositories/     # Repositorios (Repository Pattern)
│   │   │   └── auth.repository.ts
│   │   └── index.ts
│   ├── storage/             # LocalStorage, SessionStorage (futuro)
│   └── external/             # Servicios externos (futuro)
│
├── presentation/             # Capa de Presentación
│   ├── pages/               # Páginas/rutas
│   │   └── auth/
│   │       └── LoginPage.tsx
│   ├── components/          # Componentes React
│   │   ├── ui/              # Componentes UI base (Shadcn/ui)
│   │   ├── layout/          # Componentes de layout
│   │   └── features/        # Componentes por feature
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   └── index.ts
│   ├── store/               # State management (Zustand)
│   │   └── auth.store.ts
│   └── contexts/            # React contexts (si es necesario)
│
└── shared/                   # Código Compartido
    ├── utils/                # Utilidades
    │   └── index.ts
    ├── constants/            # Constantes
    │   └── index.ts
    └── lib/                  # Configuraciones
        └── index.ts
```

## 🎯 Flujo de Datos

```
Componente (Presentation)
    ↓
Hook (Presentation) - useAuth
    ↓
Service (Application) - AuthService
    ↓
Repository (Infrastructure) - AuthRepository
    ↓
API Client (Infrastructure) - apiClient
    ↓
Backend API
```

## 📝 Convenciones de Imports

### Usar path aliases (@/)
```typescript
// Domain
import type { User, LoginRequest } from '@/domain/types';
import { UserEntity } from '@/domain/entities/User.entity';

// Application
import { authService } from '@/application/services';

// Infrastructure
import { authRepository } from '@/infrastructure/api';

// Presentation
import { useAuth } from '@/presentation/hooks';
import LoginPage from '@/presentation/pages/auth/LoginPage';

// Shared
import { cn } from '@/shared/utils';
import { ROUTES } from '@/shared/constants';
```

## 🔄 Flujo para Crear Nueva Feature

1. **Domain**: Definir tipos e interfaces en `domain/types/` y `domain/interfaces/`
2. **Infrastructure**: Crear repositorio en `infrastructure/api/repositories/`
3. **Application**: Crear servicio en `application/services/`
4. **Presentation**: Crear hook en `presentation/hooks/`
5. **Presentation**: Crear componentes en `presentation/components/features/`
6. **Presentation**: Crear página en `presentation/pages/`
7. **App.tsx**: Agregar ruta

## 📦 Archivos Base Creados

### Domain
- ✅ `domain/types/index.ts` - Tipos base
- ✅ `domain/entities/User.entity.ts` - Entidad User
- ✅ `domain/interfaces/auth.interface.ts` - Interfaz IAuthRepository

### Infrastructure
- ✅ `infrastructure/api/client.ts` - Cliente HTTP con interceptors
- ✅ `infrastructure/api/repositories/auth.repository.ts` - Repositorio de auth

### Application
- ✅ `application/services/auth.service.ts` - Servicio de autenticación

### Presentation
- ✅ `presentation/pages/auth/LoginPage.tsx` - Página de login
- ✅ `presentation/hooks/useAuth.ts` - Hook de autenticación
- ✅ `presentation/store/auth.store.ts` - Store de Zustand

### Shared
- ✅ `shared/utils/index.ts` - Utilidades (cn function)
- ✅ `shared/constants/index.ts` - Constantes de la app

## 🚀 Próximos Pasos

1. Instalar componentes de Shadcn/ui según necesidad
2. Crear componentes de layout (Sidebar, Header)
3. Implementar más features siguiendo la misma estructura
4. Agregar tests cuando sea necesario

