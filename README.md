# Team Up — Frontend

Panel de administración para gestionar salas de experiencia musical en vivo.

## Stack

- React + Vite
- TailwindCSS
- Firebase Auth
- Socket.io (cliente)
- Recharts (estadísticas)

## Estructura

```
src/
├── components/
│   ├── AuthScreen.jsx        # Login / Registro
│   ├── ProfilesScreen.jsx    # Selector de perfiles
│   ├── ProfileEditScreen.jsx # Crear/editar perfil
│   ├── DashboardScreen.jsx   # Gestión de salas
│   ├── SalaScreen.jsx        # QR, experiencia, estadísticas
│   ├── SalaEditScreen.jsx    # Editar sala (nombre, color, imagen)
│   ├── StatsScreen.jsx       # Estadísticas con gráficos
│   ├── ExperienceEditScreen.jsx # Editor de experiencia visual
│   ├── QRModal.jsx           # Modal de código QR
│   ├── LinkModal.jsx         # Modal de copiar link
│   ├── NavBar.jsx            # Barra de navegación con dropdown
│   └── BackButton.jsx        # Botón volver reutilizable
├── context/
│   ├── AuthContext.jsx        # Contexto de autenticación
│   └── AppContext.jsx         # Contexto global (búsqueda, etc.)
├── utils/
│   └── api.js                 # Funciones para llamadas API
└── constants/
    └── index.js               # Constantes (URL base, colores)
```

## Rutas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | AuthScreen | Login |
| `/profiles` | ProfilesScreen | Selector de perfiles |
| `/profiles/edit` | ProfileEditScreen | Crear/editar perfil |
| `/dashboard` | DashboardScreen | Gestión de salas |
| `/sala` | SalaScreen | QR y opciones |
| `/sala/edit` | SalaEditScreen | Editar sala |
| `/experience/edit` | ExperienceEditScreen | Editor de experiencia |
| `/stats` | StatsScreen | Estadísticas |
| `/link` | LinkModal | Copiar link |

## Páginas públicas

- `experiencia.html` — Página que ven los participantes. Conecta por Socket.io, usa acelerómetro, muestra barra de progreso y milestones.

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build producción
npm run preview  # Preview del build
```

## Variables de entorno

```env
VITE_API_URL=https://tp-eventos-backend.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

## Despliegue

Frontend hosteado en Vercel: https://energia-colectiva.vercel.app
