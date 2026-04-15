# Energía Colectiva - Frontend

## Estructura

```
frontend/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AuthScreen.jsx       # Login / Registro
│   │   ├── ProfilesScreen.jsx   # Gestión de perfiles
│   │   ├── ProfileEditScreen.jsx  # Crear/editar perfil
│   │   ├── DashboardScreen.jsx  # Panel principal (gestión de salas)
│   │   ├── SalaScreen.jsx       # Ver sala (QR, Link, experiencia)
│   │   ├── SalaEditScreen.jsx  # Editar sala
│   │   ├── StatsScreen.jsx      # Estadísticas
│   │   ├── NavBar.jsx           # Barra de navegación
│   │   ├── BackButton.jsx      # Botón volver
│   │   ├── QRModal.jsx          # Modal de código QR
│   │   └── LinkModal.jsx       # Modal de copiar link
│   ├── context/
│   │   └── AuthContext.jsx      # Autenticación Firebase
│   ├── utils/
│   │   └── api.js              # Funciones API
│   └── constants/
│       └── index.js            # Constantes (COLORS, getBaseUrl)
├── experiencia.html          # Página de experiencia
├── public/js/main.js         # JS experiencia
└── css/main.css              # Estilos experiencia
```

## Rutas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | AuthScreen | Login / Registro |
| `/profiles` | ProfilesScreen | Selector de perfiles |
| `/profiles/edit` | ProfileEditScreen | Crear/editar perfil |
| `/dashboard` | DashboardScreen | Gestión de salas |
| `/sala` | SalaScreen | QR y opciones de compartir |
| `/sala/edit` | SalaEditScreen | Editar sala |
| `/stats` | StatsScreen | Estadísticas |
| `/link` | LinkModal | Copiar link |

## Navegación

### Sistema `cameFrom`

Para determinar a dónde vuelve el BackButton, se usa `localStorage.getItem('cameFrom')`:

- En **DashboardScreen**, cuando se abre una sala: `localStorage.setItem('cameFrom', 'dashboard')`
- En **NavBar**, cuando se navega a editar perfil/sala, se guarda antes de navegar
- En cada pantalla, el BackButton lee este valor y navega accordingly

### Fondos de pantalla

- **SalaScreen**, **StatsScreen**, **SalaEditScreen**: muestran el fondo de la sala actual (imagen/color + brillo)
- **ProfileEditScreen**: muestra el fondo de la sala si se navegó desde una sala

### NavBar

- **Dropdown con z-index 500** para evitar problemas con BackButton
- **Todas las funciones del menú** funcionan directamente desde cualquier pantalla:
  - Editar perfil → `/profiles/edit`
  - Editar sala → `/sala/edit`
  - Cambiar cuenta → modal
  - Cerrar sesión → `/`

### BackButton

- Envuelto en `pointer-events-none` para que no tape el dropdown del NavBar
- Acepta prop `className` para styling adicional

## LocalStorage

| Clave | Descripción |
|-------|-------------|
| `currentProfile` | Perfil seleccionado actualmente |
| `currentSala` | Sala seleccionada actualmente |
| `cameFrom` | Origen de la navegación ('dashboard', etc.) |
| `profiles_{uid}` | Lista de perfiles del usuario |
| `salas_{perfil}` | Lista de salas del perfil |

## Brillo de sala

El brillo se controla con un slider y se guarda en el campo `brightness` (0-100%).

## Errores comunes

- **Railway caído**: usa localStorage como fallback, pero sin imágenes (solo colores)
- **Imágenes no se guardan**: se guarda 'CACHED' en localStorage, imágenes reales van al backend

## Comandos

```bash
npm install
npm run dev     # Desarrollo
vercel --prod   # Producción
```

## URL Producción

https://energia-colectiva.vercel.app