# Gestión de Estado (Context API)

La aplicación utiliza **React Context API** para gestionar el estado global. Los contextos se proveen en `src/main.tsx` en el siguiente orden (exterior → interior):

```
BrowserRouter
  └─ LazyMotion
       └─ ThemeProvider
            └─ AuthProvider
                 └─ LicenseProvider
                      └─ NotificationProvider
                           └─ <App />
```

---

## 1. AuthContext — Autenticación

**Archivos:**
- `src/context/AuthContext.tsx` — Implementación del provider
- `src/context/authContextDef.ts` — Definición del tipo del contexto
- `src/context/useAuth.ts` — Hook de acceso

### Interfaz

```typescript
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

### Comportamiento

| Acción | Descripción |
|---|---|
| **Inicialización** | Si existe token en `sessionStorage`, llama a `GET /me` para cargar el usuario |
| **login(email, password)** | Llama a `POST /login`, guarda token en `sessionStorage`, actualiza estado |
| **logout()** | Llama a `POST /logout`, limpia `sessionStorage`, resetea estado |
| **setUser(user)** | Actualiza el usuario en el estado (para actualizaciones de perfil) |
| **Error 401** | El cliente HTTP limpia el token y redirige a `/login` |

### Uso

```tsx
import { useAuth } from '@/context/useAuth'

function MiComponente() {
  const { user, isAuthenticated, login, logout } = useAuth()
  // ...
}
```

### Almacenamiento

- **Clave:** `auth_token`
- **Storage:** `sessionStorage` (se pierde al cerrar la pestaña)

---

## 2. ThemeContext — Modo Claro/Oscuro

**Archivo:** `src/context/ThemeContext.tsx`

### Interfaz

```typescript
interface ThemeContextValue {
  dark: boolean
  toggle: () => void
}
```

### Comportamiento

| Acción | Descripción |
|---|---|
| **Inicialización** | Lee `localStorage['theme']`; si no existe, usa `prefers-color-scheme` del sistema |
| **toggle()** | Alterna entre claro y oscuro, guarda en `localStorage`, actualiza clase CSS |
| **Sistema** | Escucha cambios de preferencia del sistema cuando no hay elección explícita |

### Sincronización CSS

- Agrega/quita la clase `dark` en `<html>`
- Tailwind usa `.dark` como selector para estilos de modo oscuro

### Uso

```tsx
import { useTheme } from '@/context/ThemeContext'

function MiComponente() {
  const { dark, toggle } = useTheme()
  // ...
}
```

### Almacenamiento

- **Clave:** `theme`
- **Storage:** `localStorage` (persiste entre sesiones)
- **Valores:** `'dark'` | `'light'`

---

## 3. NotificationContext — Notificaciones

**Archivos:**
- `src/context/NotificationContext.tsx` — Implementación del provider
- `src/context/notificationContextDef.ts` — Definición del tipo
- `src/context/useNotifications.ts` — Hook de acceso

### Interfaz

```typescript
interface NotificationContextValue {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  fetchNotifications: (page?: number) => Promise<void>
  fetchUnreadCount: () => Promise<void>
  removeNotification: (id: string) => void
}
```

### Comportamiento

| Acción | Descripción |
|---|---|
| **Inicialización** | Cuando `isAuthenticated=true`, carga notificaciones y cuenta de no leídas |
| **Polling** | Cada **15 segundos** consulta `GET /notifications/unread-count` |
| **Detección de nuevas** | Si `unread_count` aumentó, carga lista completa y compara IDs conocidos |
| **Toast** | Las notificaciones con IDs nuevos disparan un toast via Sileo |
| **markAsRead(id)** | `POST /notifications/{id}/read`, actualiza estado local |
| **markAllAsRead()** | `POST /notifications/read-all`, resetea contadores |
| **removeNotification(id)** | Remueve del estado local sin llamada API |

### Prevención de Duplicados

El contexto mantiene un `Set<string>` con los IDs de notificaciones ya conocidas. Solo las notificaciones con IDs nuevos generan toasts.

### Uso

```tsx
import { useNotifications } from '@/context/useNotifications'

function MiComponente() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  // ...
}
```

---

## 4. LicenseContext — Estado de Licencia

**Archivos:**
- `src/context/LicenseContext.tsx` — Implementación del provider
- `src/context/licenseContextDef.ts` — Definición del tipo
- `src/context/useLicense.ts` — Hook de acceso

### Interfaz

```typescript
interface LicenseContextValue extends LicenseState {
  setExpired: (message: string) => void
  setSuspended: (message: string) => void
  clearLicense: () => void
  isBlocked: boolean
}

interface LicenseState {
  status: 'active' | 'expired' | 'suspended' | null
  message: string | null
}
```

### Comportamiento

| Acción | Descripción |
|---|---|
| **setExpired(msg)** | Marca licencia como expirada, guarda mensaje |
| **setSuspended(msg)** | Marca licencia como suspendida, guarda mensaje |
| **clearLicense()** | Resetea a estado activo |
| **isBlocked** | `true` si status es `expired` o `suspended` |

### Integración con API

El helper `handleLicenseError()` detecta errores de licencia en respuestas API y actualiza el contexto automáticamente:

```typescript
// En cualquier catch de una petición API:
if (handleLicenseError(error, license)) return  // Error de licencia manejado
```

### Efecto en UI

- **LicenseBanner**: Banner naranja (expirada) o rojo (suspendida) en la parte superior
- **Botones de creación**: Deshabilitados cuando `isBlocked === true`

### Uso

```tsx
import { useLicense } from '@/context/useLicense'

function MiComponente() {
  const { isBlocked, status, message } = useLicense()
  // ...
}
```
