# Estructura Base del Proyecto - Restify Frontend

## ✅ Estructura Clean Architecture Implementada

La estructura base está organizada siguiendo **Clean Architecture** y **Principios SOLID**:

```
src/
├── domain/                    # 🎯 Capa de Dominio
│   ├── entities/             # Entidades de negocio
│   │   └── User.entity.ts    # Entidad User con lógica de dominio
│   ├── interfaces/           # Contratos/interfaces
│   │   └── auth.interface.ts # IAuthRepository
│   ├── types/                # Tipos TypeScript base
│   │   └── index.ts          # User, LoginRequest, LoginResponse, ApiResponse
│   └── index.ts              # Barrel export
│
├── application/              # 🔧 Capa de Aplicación
│   ├── use-cases/            # Casos de uso (futuro)
│   └── services/             # Servicios de aplicación
│       ├── auth.service.ts   # AuthService con lógica de negocio
│       └── index.ts
│
├── infrastructure/           # 🔌 Capa de Infraestructura
│   ├── api/                  # Cliente API y repositorios
│   │   ├── client.ts        # Cliente HTTP con interceptors
│   │   ├── repositories/     # Repository Pattern
│   │   │   └── auth.repository.ts
│   │   └── index.ts
│   ├── storage/             # LocalStorage, SessionStorage (futuro)
│   └── external/             # Servicios externos (futuro)
│
├── presentation/             # 🎨 Capa de Presentación
│   ├── pages/               # Páginas/rutas
│   │   └── auth/
│   │       └── LoginPage.tsx
│   ├── components/          # Componentes React
│   │   ├── ui/              # Componentes UI base (Shadcn/ui)
│   │   ├── layout/          # Componentes de layout
│   │   └── features/        # Componentes por feature
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts       # Hook de autenticación
│   │   └── index.ts
│   ├── store/               # State management (Zustand)
│   │   └── auth.store.ts
│   └── contexts/            # React contexts (si es necesario)
│
└── shared/                   # 🔗 Código Compartido
    ├── utils/                # Utilidades
    │   └── index.ts          # cn() function
    ├── constants/            # Constantes
    │   └── index.ts          # ROUTES, USER_ROLES, etc.
    └── lib/                  # Configuraciones
        └── index.ts
```

## 🎯 Flujo de Datos (Ejemplo: Login)

```
LoginPage (Presentation)
    ↓
useAuth Hook (Presentation)
    ↓
AuthService (Application)
    ↓
AuthRepository (Infrastructure)
    ↓
apiClient (Infrastructure)
    ↓
Backend API
```

## 📦 Archivos Base Creados

### ✅ Domain Layer
- `domain/types/index.ts` - Tipos base (User, LoginRequest, LoginResponse, ApiResponse)
- `domain/entities/User.entity.ts` - Entidad User con métodos de dominio
- `domain/interfaces/auth.interface.ts` - Interfaz IAuthRepository

### ✅ Infrastructure Layer
- `infrastructure/api/client.ts` - Cliente HTTP con interceptors
- `infrastructure/api/repositories/auth.repository.ts` - Repositorio de autenticación

### ✅ Application Layer
- `application/services/auth.service.ts` - Servicio de autenticación con lógica de negocio

### ✅ Presentation Layer
- `presentation/pages/auth/LoginPage.tsx` - Página de login
- `presentation/hooks/useAuth.ts` - Hook personalizado de autenticación
- `presentation/store/auth.store.ts` - Store de Zustand para estado global

### ✅ Shared
- `shared/utils/index.ts` - Utilidad `cn()` para clases de Tailwind
- `shared/constants/index.ts` - Constantes (ROUTES, USER_ROLES, etc.)

## 🔄 Cómo Agregar Nueva Feature

### Ejemplo: Feature "Users"

1. **Domain** - Definir tipos e interfaces:
   ```typescript
   // domain/types/index.ts
   export interface CreateUserDto { ... }
   
   // domain/interfaces/user.interface.ts
   export interface IUserRepository { ... }
   ```

2. **Infrastructure** - Crear repositorio:
   ```typescript
   // infrastructure/api/repositories/user.repository.ts
   export class UserRepository implements IUserRepository { ... }
   ```

3. **Application** - Crear servicio:
   ```typescript
   // application/services/user.service.ts
   export class UserService {
     constructor(private userRepo: IUserRepository) {}
     // Lógica de negocio
   }
   ```

4. **Presentation** - Crear hook y componentes:
   ```typescript
   // presentation/hooks/useUsers.ts
   export const useUsers = () => { ... }
   
   // presentation/pages/users/UsersPage.tsx
   // presentation/components/features/users/UserList.tsx
   ```

## 📝 Convenciones de Imports

```typescript
// Domain
import type { User, LoginRequest } from '@/domain/types';
import { UserEntity } from '@/domain/entities/User.entity';
import type { IAuthRepository } from '@/domain/interfaces/auth.interface';

// Application
import { authService } from '@/application/services';

// Infrastructure
import { authRepository } from '@/infrastructure/api';

// Presentation
import { useAuth } from '@/presentation/hooks';
import LoginPage from '@/presentation/pages/auth/LoginPage';

// Shared
import { cn } from '@/shared/utils';
import { ROUTES, USER_ROLES } from '@/shared/constants';
```

## 🚀 Estado Actual

✅ Estructura base creada
✅ Clean Architecture implementada
✅ Principios SOLID aplicados
✅ Módulo de Auth implementado como ejemplo
✅ Path aliases configurados (@/)
✅ TypeScript estricto configurado
✅ Tailwind CSS configurado
✅ React Query configurado
✅ Zustand configurado

## 📚 Documentación

- `ESTRATEGIA_DESARROLLO.md` - Reglas y principios de desarrollo
- `ESTRUCTURA_PROYECTO.md` - Documentación detallada de la estructura
- `README.md` - Información general del proyecto

## 🎯 Próximos Pasos

1. Instalar componentes de Shadcn/ui según necesidad
2. Crear componentes de layout (Sidebar, Header)
3. Implementar más features siguiendo la misma estructura
4. Agregar tests cuando sea necesario

