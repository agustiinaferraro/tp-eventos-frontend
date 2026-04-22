// =====================
// Layout.jsx - Layout común para todas las pantallas
// =====================

import React from 'react'
import NavBar from './NavBar'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  )
}