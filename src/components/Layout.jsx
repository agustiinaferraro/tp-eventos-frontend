// =====================
// Layout.jsx - Layout común para todas las pantallas
// =====================

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