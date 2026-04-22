// =====================
// Layout.jsx - Layout común para todas las pantallas
// =====================

import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from './NavBar'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()
  
  // Auth Screen no tiene Nav/Footer
  if (location.pathname === '/') {
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