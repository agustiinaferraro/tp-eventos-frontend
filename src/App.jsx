// =====================
// App.jsx - Componente Principal con Layout anidado
// =====================

import React from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import AuthScreen from './components/AuthScreen'
import ProfilesScreen from './components/ProfilesScreen'
import ProfileEditScreen from './components/ProfileEditScreen'
import DashboardScreen from './components/DashboardScreen'
import SalaScreen from './components/SalaScreen'
import SalaEditScreen from './components/SalaEditScreen'
import LinkModal from './components/LinkModal'
import StatsScreen from './components/StatsScreen'
import ExperienceEditScreen from './components/ExperienceEditScreen'

import NavBar from './components/NavBar'
import Footer from './components/Footer'

// Layout común (similar a Next.js layout.js)
function AppLayout({ showNavBar = true, showFooter = true }) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavBar && <NavBar />}
      <div className="flex-1 pt-4">
        <Outlet />
      </div>
      {showFooter && <Footer />}
    </div>
  )
}

function AuthLayout() {
  return <Outlet />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth: sin layout */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<AuthScreen />} />
          </Route>

          {/* Dashboard y otros: con layout completo */}
          <Route element={<AppLayout />}>
            <Route path="/profiles" element={<ProfilesScreen />} />
            <Route path="/profiles/edit" element={<ProfileEditScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/stats" element={<StatsScreen />} />
            <Route path="/experience/edit" element={<ExperienceEditScreen />} />
            <Route path="/sala/edit" element={<SalaEditScreen />} />
            <Route path="/link" element={<LinkModal />} />
          </Route>

          {/* Sala: con NavBar */}
          <Route element={<AppLayout showFooter={false} />}>
            <Route path="/sala" element={<SalaScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App