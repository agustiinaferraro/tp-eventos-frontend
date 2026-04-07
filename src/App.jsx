// =====================
// App.jsx - Componente Principal
// =====================

// Importamos React para usar JSX
import React from 'react'

// Importamos las herramientas de enrutamiento de React Router
// BrowserRouter: Envuelve toda la app para habilitar la navegación
// Routes: Contenedor para definir las rutas
// Route: Define cada ruta individual
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Importamos el contexto de autenticación (provee usuario actual a toda la app)
import { AuthProvider } from './context/AuthContext'

// Importamos todos los componentes de pantalla
import AuthScreen from './components/AuthScreen'        // Pantalla de login/registro
import ProfilesScreen from './components/ProfilesScreen'  // Selector de perfiles
import ProfileEditScreen from './components/ProfileEditScreen'  // Crear/editar perfil
import DashboardScreen from './components/DashboardScreen'    // Gestión de salas
import SalaScreen from './components/SalaScreen'          // QR y compartir sala
import StatsScreen from './components/StatsScreen'        // Estadísticas de salas

// Componente principal de la aplicación
function App() {
  return (
    // AuthProvider envuelve toda la app para que cualquier componente pueda acceder al usuario
    <AuthProvider>
      {/* BrowserRouter habilita la navegación sin recargar la página */}
      <BrowserRouter>
        {/* Routes contiene todas las definiciones de rutas */}
        <Routes>
          {/* Ruta principal: muestra AuthScreen (login/registro) */}
          <Route path="/" element={<AuthScreen />} />
          
          {/* Ruta de perfiles: después de login */}
          <Route path="/profiles" element={<ProfilesScreen />} />
          
          {/* Ruta para crear nuevo perfil o editar existente */}
          <Route path="/profiles/edit" element={<ProfileEditScreen />} />
          
          {/* Ruta del dashboard: muestra las salas disponibles */}
          <Route path="/dashboard" element={<DashboardScreen />} />
          
          {/* Ruta de sala: muestra QR y opciones de compartir */}
          <Route path="/sala" element={<SalaScreen />} />
          
          {/* Ruta de estadísticas */}
          <Route path="/stats" element={<StatsScreen />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

// Exportamos App como componente default
export default App
