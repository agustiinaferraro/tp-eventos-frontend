// =====================
// SalaScreen.jsx - Pantalla de Sala (QR y Compartir)
// =====================

// Importamos React y los hooks necesarios
import React, { useState, useEffect } from 'react'

// useNavigate para navegar de vuelta al dashboard
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

// getBaseUrl: función para obtener la URL base de la experiencia
import { getBaseUrl } from '../constants'

// NavBar y BackButton
import BackButton from './BackButton'
import QRModal from './QRModal'

// Componente principal de la pantalla de sala
export default function SalaScreen() {
  // Navegación
  const navigate = useNavigate()
  const { user } = useAuth()

// =====================
// ESTADOS
// =====================
// sala: los datos de la sala seleccionada (nombre, id)
const [sala, setSala] = useState(null)

// showQR: si el modal de QR está visible
  const [showQR, setShowQR] = useState(false)
  
  // copySuccess: si el link se copió exitosamente (para mostrar feedback)
  const [copySuccess, setCopySuccess] = useState(false)

  // =====================
  // EFECTO: CARGAR SALA DE LOCALSTORAGE Y BACKEND
  // =====================
  useEffect(() => {
    // Cuando entra a esta pantalla, carga la sala que guardamos en DashboardScreen
    const saved = localStorage.getItem('currentSala')
    if (saved) {
      const salaData = JSON.parse(saved)
      setSala(salaData)
      
       // Si no tiene imagen (fue filtrada por quota), obtener del backend
      if (!salaData?.image) {
        const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
        if (user?.uid && profile.name && salaData.name) {
          fetch(`${import.meta.env.VITE_SERVER_URL || 'https://tp-eventos-backend.onrender.com'}/api/users/${user.uid}/salas?profile=${encodeURIComponent(profile.name)}`)
            .then(res => res.json())
            .then(data => {
              if (data.salas) {
                const updatedSala = data.salas.find(s => s.name === salaData.name)
                if (updatedSala) {
                  console.log('Got sala from backend - has image:', !!updatedSala.image)
                  setSala(updatedSala)
                  // Guardar en localStorage sin imagen (para evitar quota)
                  const salaForLocal = { ...updatedSala, image: null }
                  localStorage.setItem('currentSala', JSON.stringify(salaForLocal))
                }
              }
            })
            .catch(err => console.error('Error loading sala from backend:', err))
        }
      }
    }
  }, [])

  // =====================
  // FUNCIÓN: IR A LA EXPERIENCIA
  // =====================
   const goToExperience = () => {
    if (sala) {
      const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
      const profileParam = profile.name ? `&profile=${encodeURIComponent(profile.name)}` : ''
      const url = getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-') + profileParam
      window.location.href = url
    }
  }

  // =====================
  // FUNCIÓN: MOSTRAR MODAL DE QR
  // =====================
   function getCurrentProfileName() {
    const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
    return profile.name || ''
  }

  const showQRModal = () => {
    setShowQR(true)
    window.history.replaceState({}, '', '?qr=open')
    
    setTimeout(() => {
      if (sala && typeof QRCode !== 'undefined') {
        const qrBox = document.getElementById('qrCodeBox')
        if (qrBox) {
          qrBox.innerHTML = ''
          
          const profileName = getCurrentProfileName()
          const salaSlug = sala.name.toLowerCase().replace(/\s+/g, '-')
          const profileParam = profileName ? `&profile=${encodeURIComponent(profileName)}` : ''
          const url = getBaseUrl() + '/experiencia.html?sala=' + salaSlug + profileParam
          
          new QRCode(qrBox, {
            text: url,
            width: 196,
            height: 196,
            colorDark: "#0a0a0a",
            colorLight: "#ffffff"
          })
        }
      }
    }, 100)
  }

  // =====================
  // FUNCIÓN: COPIAR LINK
  // =====================
   const copyLink = () => {
    const profileName = getCurrentProfileName()
    const salaSlug = sala.name.toLowerCase().replace(/\s+/g, '-')
    const profileParam = profileName ? `&profile=${encodeURIComponent(profileName)}` : ''
    const url = getBaseUrl() + '/experiencia.html?sala=' + salaSlug + profileParam
    
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true)
      setTimeout(() => setShowCopy(false), 1500)
    })
  }

  // =====================
  // SEGURIDAD: SI NO HAY SALA, NO MOSTRAMOS NADA
  // =====================
  if (!sala) return null

// =====================
  // RENDERIZADO
  // =====================
  return (
    <div className='flex flex-col items-center min-h-screen w-full p-10 relative'>
      {/* Fondo con brillo */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: sala?.image ? `url(${sala.image}) center/cover no-repeat` : sala?.color || '#000',
          filter: sala?.brightness ? `brightness(${sala.brightness}%)` : undefined
        }}
      />
      
      {/* Overlay oscuro */}
      <div className='absolute inset-0 bg-black/70 z-0'></div>
      
      {/* BackButton - solo cuando no está el QR */}
      {!showQR && (
        <div className="pointer-events-none w-full max-w-5xl">
          <BackButton onClick={() => {
          const cameFrom = localStorage.getItem('cameFrom')
          localStorage.removeItem('cameFrom')
          if (cameFrom === 'dashboard') {
            navigate('/dashboard')
          } else {
            navigate('/profiles')
          }
        }} />
        </div>
      )}
      
      {/* Contenido relativo para estar arriba del overlay */}
      <div className='relative z-10 w-full max-w-md flex flex-col items-center'>
      
{/* Título con el nombre de la sala */}
      <h1 className="text-4xl md:text-6xl tracking-widest text-green-400 mt-8 mb-16 text-center w-full max-w-5xl">
        {sala.name.toUpperCase()}
      </h1>
      
      {/* Botón principal: Ir a la experiencia */}
      <button
        className="w-full max-w-md bg-transparent border-2 border-green-400 text-green-400 text-sm py-4 px-10 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-green-400 hover:text-black mt-4"
        onClick={goToExperience}
      >
        IR A LA EXPERIENCIA
      </button>
      
      {/* Botones de compartir (QR y Link) */}
      <div className="flex gap-4 mt-8 w-full max-w-md">
        
        {/* Botón QR */}
        <button
          className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm py-3 px-5 rounded-lg cursor-pointer tracking-wider transition-all hover:border-green-400 hover:text-green-400 hover:scale-105"
          onClick={showQRModal}
        >
          📷 QR
        </button>
        
        {/* Botón Link */}
        <button
          className="flex-1 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm py-3 px-5 rounded-lg cursor-pointer tracking-wider transition-all hover:border-green-400 hover:text-green-400 hover:scale-105"
          onClick={() => navigate('/link')}
        >
          🔗 LINK
        </button>
      </div>
      
      {/* Botón estadísticas */}
      <button
        className="mt-6 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm py-3 px-6 rounded-lg cursor-pointer tracking-wider transition-all hover:border-green-400 hover:text-green-400"
        onClick={() => navigate('/stats', { state: { salaName: sala.name, salaData: sala } })}
      >
        📊 ESTADÍSTICAS
      </button>

      {/* Botón personalizar experiencia */}
      <button
        className="mt-3 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm py-3 px-6 rounded-lg cursor-pointer tracking-wider transition-all hover:border-green-400 hover:text-green-400"
        onClick={() => navigate('/experience/edit', { state: { sala } })}
      >
        ✏️ PERSONALIZAR EXPERIENCIA
      </button>

      {/* ===================== */}
      {/* MODAL: CÓDIGO QR */}
      {/* ===================== */}
       <QRModal 
        sala={sala} 
        show={showQR} 
        profileName={getCurrentProfileName()}
        onClose={() => {
          setShowQR(false)
          window.history.replaceState({}, '', window.location.pathname)
        }} 
      />

      </div>
    </div>
  )
}
