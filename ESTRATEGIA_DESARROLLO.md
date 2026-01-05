# Estrategia de Desarrollo - Restify Frontend

## 📐 Arquitectura

### Clean Architecture (Adaptada a Frontend)

```
src/
├── domain/              # Capa de dominio (entidades, interfaces)
│   ├── entities/        # Entidades de negocio
│   ├── interfaces/      # Contratos/interfaces
│   └── types/           # Tipos TypeScript
├── application/         # Capa de aplicación (use cases, lógica de negocio)
│   ├── use-cases/       # Casos de uso
│   └── services/        # Servicios de aplicación
├── infrastructure/      # Capa de infraestructura
│   ├── api/             # Cliente API, adapters
│   ├── storage/         # LocalStorage, sessionStorage
│   └── external/        # Servicios externos
├── presentation/        # Capa de presentación
│   ├── pages/           # Páginas/rutas
│   ├── components/      # Componentes UI
│   ├── hooks/           # Custom hooks
│   └── contexts/        # React contexts
└── shared/              # Código compartido
    ├── utils/           # Utilidades
    ├── constants/       # Constantes
    └── lib/             # Librerías/configuraciones
```

### Estructura por Feature (Alternativa)

```
src/
├── features/
│   ├── auth/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   └── interfaces/
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── services/
│   │   ├── infrastructure/
│   │   │   └── api/
│   │   └── presentation/
│   │       ├── pages/
│   │       ├── components/
│   │       └── hooks/
│   ├── users/
│   ├── orders/
│   └── ...
```

---

## 🎯 Principios SOLID

### 1. Single Responsibility Principle (SRP)
**Cada componente/clase/función debe tener una sola razón para cambiar**

✅ **Bien:**
```typescript
// Componente solo renderiza
const UserCard = ({ user }: { user: User }) => {
  return <div>{user.name}</div>;
};

// Hook solo maneja lógica de datos
const useUserData = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getById(id),
  });
};
```

❌ **Mal:**
```typescript
// Componente con múltiples responsabilidades
const UserCard = () => {
  // Fetch data
  // Transform data
  // Render UI
  // Handle errors
  // Manage state
};
```

### 2. Open/Closed Principle (OCP)
**Abierto para extensión, cerrado para modificación**

✅ **Bien:**
```typescript
// Componente base extensible
<Button variant="primary" size="lg" />
<Button variant="secondary" icon={<Icon />} />

// Usar composición
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
</Card>
```

### 3. Liskov Substitution Principle (LSP)
**Los componentes deben ser intercambiables si cumplen el mismo contrato**

✅ **Bien:**
```typescript
interface FormField {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

// Input, Select, Textarea todos implementan FormField
<Input {...formFieldProps} />
<Select {...formFieldProps} />
<Textarea {...formFieldProps} />
```

### 4. Interface Segregation Principle (ISP)
**Interfaces específicas y pequeñas, no interfaces grandes**

✅ **Bien:**
```typescript
interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User>;
}

interface UserEmailService {
  sendEmail(userId: string, email: string): Promise<void>;
}
```

❌ **Mal:**
```typescript
interface UserService {
  getUsers(): Promise<User[]>;
  createUser(): Promise<User>;
  sendEmail(): Promise<void>; // No todos lo necesitan
}
```

### 5. Dependency Inversion Principle (DIP)
**Depender de abstracciones, no de implementaciones concretas**

✅ **Bien:**
```typescript
interface IAuthService {
  login(credentials: LoginData): Promise<AuthResponse>;
}

// Componente depende de la interfaz
const useAuth = (authService: IAuthService) => {
  // ...
};
```

---

## 🏗️ Patrones de Diseño

### 1. Repository Pattern
**Abstracción de acceso a datos**

```typescript
interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User>;
  create(user: CreateUserDto): Promise<User>;
  update(id: string, user: UpdateUserDto): Promise<User>;
  delete(id: string): Promise<void>;
}

class UserRepository implements IUserRepository {
  constructor(private api: ApiClient) {}
  
  async findAll(): Promise<User[]> {
    const response = await this.api.get('/api/users');
    return response.data;
  }
  // ... más métodos
}
```

### 2. Service Layer Pattern
**Lógica de negocio separada de la UI**

```typescript
class UserService {
  constructor(
    private userRepo: IUserRepository,
    private validator: IValidator
  ) {}
  
  async createUser(data: CreateUserDto): Promise<User> {
    // Validación
    this.validator.validate(data);
    
    // Transformación
    const userData = this.transformCreateData(data);
    
    // Llamada al repositorio
    const user = await this.userRepo.create(userData);
    
    // Post-procesamiento
    return this.enrichUser(user);
  }
}
```

### 3. Custom Hooks Pattern
**Encapsular lógica reutilizable**

```typescript
const useUsers = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => userService.getAll(),
  });
  
  return { 
    users: data, 
    isLoading, 
    error,
    refetch: () => queryClient.invalidateQueries(['users']),
  };
};

// Uso en componente
const UsersList = () => {
  const { users, isLoading } = useUsers();
  // ...
};
```

### 4. Compound Components Pattern
**Componentes que trabajan juntos**

```typescript
const Card = ({ children }: { children: React.ReactNode }) => {
  return <div className="card">{children}</div>;
};

Card.Header = ({ children }: { children: React.ReactNode }) => (
  <div className="card-header">{children}</div>
);

Card.Body = ({ children }: { children: React.ReactNode }) => (
  <div className="card-body">{children}</div>
);

Card.Footer = ({ children }: { children: React.ReactNode }) => (
  <div className="card-footer">{children}</div>
);

// Uso
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### 5. Render Props / Children as Function
**Compartir lógica entre componentes**

```typescript
<DataFetcher queryKey={['users']} queryFn={getUsers}>
  {({ data, loading, error }) => (
    loading ? <Spinner /> : <UserList users={data} />
  )}
</DataFetcher>
```

---

## 🧹 Clean Code

### 1. Nombres Descriptivos

❌ **Mal:**
```typescript
const d = new Date();
const u = await getU();
const calc = (a, b) => a + b;
```

✅ **Bien:**
```typescript
const currentDate = new Date();
const users = await getUsers();
const calculateTotal = (subtotal: number, tax: number) => subtotal + tax;
```

### 2. Funciones Pequeñas y Enfocadas

❌ **Mal:**
```typescript
const processOrder = (order) => {
  // Validar orden
  // Calcular totales
  // Aplicar descuentos
  // Procesar pago
  // Enviar email
  // Actualizar inventario
  // ... 50 líneas más
};
```

✅ **Bien:**
```typescript
const validateOrder = (order: Order) => { /* ... */ };
const calculateTotal = (items: OrderItem[]) => { /* ... */ };
const applyDiscounts = (order: Order) => { /* ... */ };
const processPayment = (order: Order) => { /* ... */ };

const processOrder = async (order: Order) => {
  validateOrder(order);
  const total = calculateTotal(order.items);
  const orderWithDiscount = applyDiscounts({ ...order, total });
  await processPayment(orderWithDiscount);
  return orderWithDiscount;
};
```

### 3. DRY (Don't Repeat Yourself)

✅ **Bien:**
```typescript
// Lógica reutilizable
const useFormValidation = <T>(schema: ZodSchema<T>) => {
  const form = useForm<T>({
    resolver: zodResolver(schema),
  });
  return form;
};

// Usar en múltiples formularios
const loginForm = useFormValidation(loginSchema);
const registerForm = useFormValidation(registerSchema);
```

### 4. Comentarios Útiles

❌ **Mal:**
```typescript
// Incrementa el contador
count++;

// Obtiene usuarios
const users = await getUsers();
```

✅ **Bien:**
```typescript
// Incrementamos el contador después de validar
// para evitar estados inconsistentes
if (isValid) count++;

// Fetch usuarios con cache de 5 minutos
// para reducir llamadas al servidor
const users = await getUsers();
```

### 5. Evitar Magic Numbers/Strings

❌ **Mal:**
```typescript
if (status === 1) { /* ... */ }
setTimeout(() => {}, 3000);
```

✅ **Bien:**
```typescript
const ORDER_STATUS = {
  PENDING: 1,
  PROCESSING: 2,
  COMPLETED: 3,
} as const;

if (status === ORDER_STATUS.PENDING) { /* ... */ }

const REFRESH_INTERVAL = 3000; // 3 segundos
setTimeout(() => {}, REFRESH_INTERVAL);
```

---

## 🔒 Seguridad

### 1. Validación de Entrada
- ✅ Usar Zod para validación de esquemas
- ✅ Validar en cliente Y servidor
- ✅ Sanitizar inputs antes de enviar
- ✅ Validar tipos de archivo en uploads

```typescript
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
```

### 2. Manejo Seguro de Tokens
- ✅ Token en httpOnly cookies (preferible) o localStorage
- ✅ Interceptors para refresh automático
- ✅ Limpieza al logout
- ✅ Verificar expiración antes de usar

```typescript
// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Intentar refresh token
      // Si falla, redirigir a login
    }
  }
);
```

### 3. Protección de Rutas
- ✅ Private routes con verificación de autenticación
- ✅ Role-based access control (RBAC)
- ✅ Verificar permisos antes de mostrar acciones

```typescript
const PrivateRoute = ({ children, requiredRole }: Props) => {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) return <Navigate to="/auth/login" />;
  if (requiredRole && user?.rol !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }
  return <>{children}</>;
};
```

### 4. XSS Prevention
- ✅ React escapa automáticamente
- ✅ Evitar `dangerouslySetInnerHTML` sin sanitización
- ✅ Validar URLs antes de renderizar
- ✅ Usar librerías de sanitización si es necesario

### 5. CSRF Protection
- ✅ Tokens CSRF en formularios críticos
- ✅ Verificar origen de requests
- ✅ Headers de seguridad

---

## 📈 Escalabilidad

### 1. Code Splitting
```typescript
// Lazy loading de rutas
const Dashboard = lazy(() => import('@/pages/dashboard/DashboardPage'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### 2. Modularización
- ✅ Features como módulos independientes
- ✅ Barrel exports (`index.ts`) para imports limpios
- ✅ Imports organizados y consistentes

```typescript
// features/users/index.ts
export { UserList } from './presentation/components/UserList';
export { useUsers } from './presentation/hooks/useUsers';
export type { User } from './domain/entities/User';
```

### 3. State Management
- ✅ Zustand para estado global pequeño
- ✅ React Query para estado del servidor
- ✅ Context API solo cuando sea necesario
- ✅ Estado local cuando sea posible

### 4. Performance
- ✅ Memoización con `useMemo` y `useCallback`
- ✅ React.memo para componentes pesados
- ✅ Virtualización para listas grandes
- ✅ Lazy loading de imágenes

```typescript
// Memoización de cálculos costosos
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);

// Memoización de callbacks
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);
```

---

## 📝 Convenciones de Código

### 1. Naming Conventions
- **Componentes**: PascalCase (`UserCard.tsx`, `OrderList.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`, `useUsers.ts`)
- **Utilidades**: camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Interfaces/Types**: PascalCase (`User`, `LoginRequest`)
- **Archivos de configuración**: kebab-case (`api-config.ts`)

### 2. Organización de Imports
```typescript
// 1. React/Next
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Librerías externas
import axios from 'axios';
import { z } from 'zod';

// 3. Internos (absolute imports con @/)
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';

// 4. Relativos
import { UserCard } from './UserCard';
import { formatDate } from '../utils/date';
```

### 3. TypeScript Estricto
- ✅ Tipos explícitos siempre
- ✅ Evitar `any` (usar `unknown` si es necesario)
- ✅ Interfaces para contratos
- ✅ Types para uniones/intersections
- ✅ Generics cuando sea apropiado

```typescript
// ✅ Bien
interface User {
  id: string;
  name: string;
}

const getUser = async (id: string): Promise<User> => {
  // ...
};

// ❌ Mal
const getUser = async (id: any): Promise<any> => {
  // ...
};
```

### 4. Estructura de Componentes
```typescript
// 1. Imports
import { useState } from 'react';

// 2. Types/Interfaces
interface Props {
  user: User;
  onEdit: (user: User) => void;
}

// 3. Componente
export const UserCard = ({ user, onEdit }: Props) => {
  // 4. Hooks
  const [isEditing, setIsEditing] = useState(false);
  
  // 5. Handlers
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
};
```

---

## 🧪 Testing Strategy

### 1. Unit Tests
- Funciones puras
- Utilidades
- Helpers

### 2. Integration Tests
- Hooks personalizados
- Servicios
- Flujos de datos

### 3. Component Tests
- Componentes aislados
- Interacciones del usuario
- Estados del componente

### 4. E2E Tests
- Flujos críticos completos
- Autenticación
- Procesos de negocio principales

---

## 📚 Documentación

### 1. JSDoc para Funciones Complejas
```typescript
/**
 * Calcula el total de una orden incluyendo IVA y propina
 * 
 * @param items - Array de items de la orden
 * @param taxRate - Tasa de IVA (ej: 0.16 para 16%)
 * @param tip - Propina opcional
 * @returns Objeto con subtotal, iva, propina y total
 * 
 * @example
 * const total = calculateOrderTotal(items, 0.16, 50);
 */
const calculateOrderTotal = (
  items: OrderItem[],
  taxRate: number,
  tip?: number
) => {
  // ...
};
```

### 2. README por Feature
- Descripción del feature
- Cómo usar
- Ejemplos
- Dependencias

### 3. Comentarios para Decisiones
```typescript
// Usamos useQuery en lugar de useState + useEffect
// porque React Query maneja automáticamente:
// - Cache
// - Refetch
// - Loading states
// - Error handling
const { data } = useQuery(['users'], getUsers);
```

---

## 🎨 Estilos y UI

### 1. Tailwind CSS
- ✅ Utility-first approach
- ✅ Componentes reutilizables con Shadcn/ui
- ✅ Variables CSS para temas
- ✅ Dark mode support

### 2. Componentes UI
- ✅ Componentes base de Shadcn/ui
- ✅ Composición sobre configuración
- ✅ Props consistentes
- ✅ Accesibilidad (ARIA)

### 3. Responsive Design
- ✅ Mobile-first approach
- ✅ Breakpoints consistentes
- ✅ Touch-friendly en móviles

---

## 🔄 Flujo de Desarrollo

### 1. Crear Nueva Feature
1. Definir tipos/interfaces en `domain/`
2. Crear repositorio en `infrastructure/api/`
3. Crear servicio en `application/services/`
4. Crear hooks en `presentation/hooks/`
5. Crear componentes en `presentation/components/`
6. Crear página en `presentation/pages/`
7. Agregar ruta en `App.tsx`

### 2. Checklist Antes de Commit
- [ ] Código sigue principios SOLID
- [ ] Nombres descriptivos
- [ ] Funciones pequeñas y enfocadas
- [ ] Validación de tipos
- [ ] Manejo de errores
- [ ] Loading states
- [ ] Responsive design
- [ ] Accesibilidad básica
- [ ] Sin console.logs
- [ ] Sin código comentado innecesario

---

## 🚫 Anti-Patterns a Evitar

### 1. ❌ Props Drilling
```typescript
// Mal: Pasar props por muchos niveles
<App user={user}>
  <Layout user={user}>
    <Header user={user}>
      <UserMenu user={user} />
    </Header>
  </Layout>
</App>

// Bien: Usar Context o State Management
const UserProvider = ({ children }) => {
  const user = useUser();
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
```

### 2. ❌ Lógica de Negocio en Componentes
```typescript
// Mal: Lógica compleja en componente
const OrderList = () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        // Transformación compleja aquí
        const transformed = data.map(/* ... */);
        setOrders(transformed);
      });
  }, []);
  // ...
};

// Bien: Lógica en hook o servicio
const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getAll(),
  });
};
```

### 3. ❌ Mutación Directa de Estado
```typescript
// Mal: Mutar estado directamente
const [users, setUsers] = useState([]);
users.push(newUser); // ❌

// Bien: Crear nuevo estado
setUsers([...users, newUser]); // ✅
```

### 4. ❌ Dependencias Faltantes en useEffect
```typescript
// Mal: Dependencias faltantes
useEffect(() => {
  fetchUser(userId);
}, []); // ❌ Falta userId

// Bien: Todas las dependencias
useEffect(() => {
  fetchUser(userId);
}, [userId]); // ✅
```

---

## 📦 Stack Tecnológico

- **React 18** + **TypeScript**
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Estilos
- **Shadcn/ui** - Componentes UI
- **Zod** - Validación
- **React Hook Form** - Formularios

---

## 🎯 Prioridades

1. **SOLID** - Siempre aplicar
2. **Clean Code** - Siempre aplicar
3. **Seguridad** - Crítico
4. **Escalabilidad** - Importante
5. **Performance** - Optimizar cuando sea necesario
6. **Testing** - Agregar progresivamente

---

**Última actualización**: 2025-11-23

