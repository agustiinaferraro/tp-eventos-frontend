// =====================
// Layout.jsx - Layout común para todas las pantallas
// =====================

import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from './NavBar'
import Footer from './Footer'

export default function Layout() {
  const location = useLocation()

  const hasProfile = localStorage.getItem('currentProfile')
    ? JSON.parse(localStorage.getItem('currentProfile'))?.name
    : null

  const hideLayout =
    location.pathname === '/' ||
    location.pathname.includes('experiencia') ||
    !hasProfile

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