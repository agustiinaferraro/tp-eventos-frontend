# Energía Colectiva - Frontend

## Estructura

```
frontend/
├── src/
│   ├── components/        # Componentes React
│   │   ├── AuthScreen.jsx       # Login / Registro
│   │   ├── ProfilesScreen.jsx   # Gestión de perfiles
│   │   ├── ProfileEditScreen.jsx
│   │   ├── DashboardScreen.jsx  # Panel principal
│   │   ├── SalaScreen.jsx       # Ver sala
│   │   └── StatsScreen.jsx      # Estadísticas
│   ├── context/
│   │   └── AuthContext.jsx      # Autenticación Firebase
│   ├── utils/
│   │   └── api.js              # Funciones API
│   └── main.jsx
├── experiencia.html          # Página de experiencia
├── public/js/main.js         # JS experiencia
└── css/main.css              # Estilos experiencia
```

## Comandos

```bash
npm install
npm run dev     # Desarrollo
vercel --prod   # Producción
```

## URL Producción

https://energia-colectiva.vercel.app
