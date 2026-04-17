# Arquitectura del Proyecto

## Visión General

S!NTyC es una **SPA (Single Page Application)** que sigue una arquitectura basada en componentes con separación clara de responsabilidades:

```
┌─────────────────────────────────────────────────┐
│                   index.html                     │
│  (detección de dark mode, carga de main.tsx)     │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│                  main.tsx                         │
│  Provider Stack (de exterior a interior):        │
│  1. BrowserRouter                                │
│  2. LazyMotion (Framer Motion)                   │
│  3. ThemeProvider                                │
│  4. AuthProvider                                 │
│  5. LicenseProvider                              │
│  6. NotificationProvider                         │
│  7. <App />                                      │
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│                   App.tsx                         │
│  Definición de rutas con React Router            │
│  Guardias de ruta (ProtectedRoute, GuestRoute)   │
│  Layout principal (AppLayout)                    │
└─────────────────────────────────────────────────┘
```

## Capas de la Aplicación

### 1. Capa de Presentación (`pages/`, `components/`)
- **Pages**: Contenedores de página completos, cada uno corresponde a una ruta
- **Components**: Piezas reutilizables de UI (badges, modales, skeletons, etc.)
- Cada página gestiona su propio estado local con `useState`/`useReducer`
- Formularios gestionados con **React Hook Form** + **Zod**

### 2. Capa de Estado (`context/`)
- **AuthContext**: Estado de autenticación (usuario, token, login/logout)
- **ThemeContext**: Modo claro/oscuro
- **NotificationContext**: Notificaciones en tiempo real (polling cada 15s)
- **LicenseContext**: Estado de licencia (activa/expirada/suspendida)

### 3. Capa de Comunicación (`api/`)
- **client.ts**: Cliente HTTP base con interceptores
- **Módulos**: Un archivo por dominio (tasks, meetings, areas, users, etc.)
- Manejo automático de autenticación (Bearer token)
- Desempaquetado automático de respuestas Laravel (`{ data: T }`)
- Gestión centralizada de errores (401 → redirect login)

### 4. Capa de Validación (`schemas/`)
- Esquemas Zod para cada formulario
- Integrados con React Hook Form vía `@hookform/resolvers`
- Mensajes de error en español

### 5. Capa de Tipos (`types/`)
- Interfaces TypeScript para cada entidad del dominio
- Enums como objetos `as const` con tipos derivados
- Tipos de request/response para cada endpoint

### 6. Capa de Utilidades (`utils/`)
- Formateo de fechas (zona horaria América/Bogotá)
- Cálculos de progreso de tareas
- Manejo de errores de licencia
- Guardia de navegación para formularios sin guardar

## Flujo de Datos

```
Usuario → Componente UI → React Hook Form + Zod
                              │
                    (validación OK)
                              │
                              ▼
                     API Service (api/*.ts)
                              │
                              ▼
                    HTTP Client (client.ts)
                     ┌────────┤
                     │        ▼
                     │   Backend Laravel
                     │        │
                     │        ▼
                     │   Respuesta JSON
                     │        │
                     ▼        ▼
              Error Handler   Unwrap { data: T }
                     │              │
                     ▼              ▼
              Toast / Redirect   setState / Context update
                                       │
                                       ▼
                                 Re-render UI
```

## Patrón de Autenticación

```
1. Login exitoso
      │
      ├─ Token → sessionStorage['auth_token']
      └─ User  → AuthContext.state.user
      
2. Petición autenticada
      │
      └─ client.ts lee sessionStorage
         └─ Agrega header: Authorization: Bearer {token}

3. Respuesta 401
      │
      └─ client.ts intercepta
         ├─ Limpia sessionStorage
         └─ Redirect → /login
```

## Patrón de Notificaciones

```
1. AuthProvider confirma login
      │
      └─ NotificationProvider se inicializa
         │
         ├─ Carga notificaciones iniciales
         └─ Inicia polling cada 15 segundos
                    │
                    ├─ Obtiene unread_count
                    │      │
                    │      └─ ¿Cambió?
                    │           │
                    │           ├─ Sí → Carga lista completa
                    │           │        └─ Detecta IDs nuevos
                    │           │             └─ Toast por cada nueva
                    │           │
                    │           └─ No → No hace nada
                    │
                    └─ Actualiza badge en NotificationBell
```

## Configuración de Build

| Herramienta | Configuración |
|---|---|
| **Vite** | React plugin + Tailwind CSS plugin |
| **TypeScript** | Target ES2023, strict mode, bundler resolution |
| **Tailwind CSS** | v4 con variables CSS custom (Cybertec brand) |
| **ESLint** | TypeScript ESLint + React Hooks + React Refresh |

## Estructura de Archivos Clave

```
src/
├── main.tsx              ← Punto de entrada, provider stack
├── App.tsx               ← Definición de rutas
├── index.css             ← Estilos globales, variables CSS
├── api/client.ts         ← Cliente HTTP base
├── context/AuthContext.tsx ← Contexto de autenticación
└── components/layout/AppLayout.tsx ← Layout con sidebar
```
