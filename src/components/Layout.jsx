// =====================
// Layout.jsx - Layout común para todas las pantallas
// =====================

import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from './NavBar'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()

  // Ocultar Nav/Footer en pantallas específicas
  const hideLayout =
    location.pathname === '/' ||
    location.pathname.includes('experiencia')

  if (hideLayout) {
    return <Outlet />
  }

  return (
    <>
      <NavBar />
      <Outlet />
      <Footer />
    </>
  )
}