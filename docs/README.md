# S!NTyC — Sistema Integral de Tareas y Compromisos

## Descripción General

**S!NTyC** es una aplicación web de gestión de tareas y compromisos organizacionales desarrollada para **Insumma / Cybertec**. Permite crear, asignar, delegar, dar seguimiento y aprobar tareas dentro de una estructura jerárquica de áreas y roles.

La aplicación está construida con **React 19**, **TypeScript**, **Vite** y **Tailwind CSS 4**, conectándose a un backend **Laravel** vía API REST.

---

## Índice de Documentación

| Documento | Descripción |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitectura general del proyecto |
| [ROUTING.md](ROUTING.md) | Rutas, páginas y control de acceso |
| [API.md](API.md) | Capa de comunicación con el backend |
| [TYPES.md](TYPES.md) | Definiciones de tipos TypeScript |
| [SCHEMAS.md](SCHEMAS.md) | Esquemas de validación Zod |
| [STATE.md](STATE.md) | Gestión de estado (Contextos de React) |
| [COMPONENTS.md](COMPONENTS.md) | Componentes reutilizables |
| [PAGES.md](PAGES.md) | Páginas de la aplicación |
| [UTILS.md](UTILS.md) | Utilidades y helpers |
| [RBAC.md](RBAC.md) | Control de acceso basado en roles |
| [WORKFLOWS.md](WORKFLOWS.md) | Flujos de negocio (detalle operativo por rol) |
| [USER_MANUAL.md](USER_MANUAL.md) | Manual de usuario organizado por rol |

---

## Requisitos

- **Node.js** ≥ 18
- **npm** o **pnpm**
- Backend Laravel con la API ejecutándose (por defecto `http://localhost:8000/api`)

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd S!ntyc-insumma

# Instalar dependencias
npm install

# Configurar variable de entorno (opcional)
# Crear .env con:
VITE_API_URL=http://localhost:8000/api
```

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Inicia servidor de desarrollo (Vite) |
| `npm run build` | Compila TypeScript y genera build de producción |
| `npm run lint` | Ejecuta ESLint en todo el proyecto |
| `npm run preview` | Previsualiza el build de producción |

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| React | 19.2.4 | Framework de UI |
| React Router | 7.13.1 | Enrutamiento SPA |
| TypeScript | ~5.9.3 | Tipado estático |
| Vite | 7.3.1 | Build tool + dev server |
| Tailwind CSS | 4.2.1 | Framework CSS utilitario |
| Zod | 4.3.6 | Validación de formularios |
| React Hook Form | 7.71.2 | Manejo de formularios |
| Framer Motion | 12.38.0 | Animaciones |
| Sileo | 0.1.5 | Notificaciones toast |
| React Icons | 5.6.0 | Iconografía |

## Estructura de Carpetas

```
src/
├── api/              # Cliente HTTP y servicios API
├── assets/           # Recursos estáticos (imágenes, fuentes)
├── components/       # Componentes reutilizables
│   ├── dashboard/    # Componentes del dashboard
│   ├── guards/       # Guardias de ruta (auth, guest)
│   ├── layout/       # Layout principal (sidebar, navbar)
│   ├── notifications/# Bell, panel, toaster
│   ├── tasks/        # Componentes de tareas
│   └── ui/           # Componentes UI genéricos
├── context/          # Proveedores de contexto React
├── pages/            # Páginas organizadas por dominio
│   ├── areas/        # Gestión de áreas
│   ├── attachments/  # Gestión de archivos adjuntos
│   ├── auth/         # Login
│   ├── consolidated/ # Vista consolidada
│   ├── dashboard/    # Dashboard por rol
│   ├── meetings/     # Gestión de reuniones
│   ├── notifications/# Página de notificaciones
│   ├── profile/      # Perfil de usuario
│   ├── settings/     # Configuración del sistema
│   ├── tasks/        # Gestión de tareas
│   └── users/        # Gestión de usuarios
├── schemas/          # Esquemas de validación Zod
├── types/            # Definiciones de tipos TypeScript
└── utils/            # Funciones utilitarias
```

## Variables de Entorno

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api` | URL base de la API backend |

## Marca / Identidad Visual

- **Paleta Cybertec**: Navy (`#181D5E`), Radar Blue (`#1B92D0`), Grafito (`#202020`), Deep (`#0B1020`)
- **Fuente**: Bahnschrift
- **Modo oscuro**: Soporte completo vía clase `.dark` en Tailwind
- **Accesibilidad**: Soporte para `prefers-reduced-motion` (WCAG 2.3.3)
