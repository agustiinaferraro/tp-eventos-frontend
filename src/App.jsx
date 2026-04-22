// =====================
// App.jsx - Componente Principal
// =====================

import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Layout from './components/Layout'

import AuthScreen from './components/AuthScreen'
import ProfilesScreen from './components/ProfilesScreen'
import ProfileEditScreen from './components/ProfileEditScreen'
import DashboardScreen from './components/DashboardScreen'
import SalaScreen from './components/SalaScreen'
import SalaEditScreen from './components/SalaEditScreen'
import LinkModal from './components/LinkModal'
import StatsScreen from './components/StatsScreen'
import ExperienceEditScreen from './components/ExperienceEditScreen'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthScreen />} />
          
          <Route element={<Layout />}>
            <Route path="/profiles" element={<ProfilesScreen />} />
            <Route path="/profiles/edit" element={<ProfileEditScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/sala" element={<SalaScreen />} />
            <Route path="/sala/edit" element={<SalaEditScreen />} />
            <Route path="/stats" element={<StatsScreen />} />
            <Route path="/link" element={<LinkModal />} />
            <Route path="/experience/edit" element={<ExperienceEditScreen />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App