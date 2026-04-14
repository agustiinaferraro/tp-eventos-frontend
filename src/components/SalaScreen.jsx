// =====================
// SalaScreen.jsx - Pantalla de Sala (QR y Compartir)
// =====================

// Importamos React y los hooks necesarios
import React, { useState, useEffect } from 'react'

// useNavigate para navegar de vuelta al dashboard
import { useNavigate } from 'react-router-dom'

// getBaseUrl: función para obtener la URL base de la experiencia
import { getBaseUrl } from '../constants'

// Componente principal de la pantalla de sala
export default function SalaScreen() {
  // Navegación
  const navigate = useNavigate()

  // =====================
  // ESTADOS
  // =====================
  // sala: los datos de la sala seleccionada (nombre, id)
  const [sala, setSala] = useState(null)
  
  // showQR: si el modal de QR está visible
  const [showQR, setShowQR] = useState(false)
  
  // showCopy: si el modal de copiar link está visible
  const [showCopy, setShowCopy] = useState(false)
  
  // copySuccess: si el link se copió exitosamente (para mostrar feedback)
  const [copySuccess, setCopySuccess] = useState(false)

  // =====================
  // EFECTO: CARGAR SALA DE LOCALSTORAGE
  // =====================
  useEffect(() => {
    // Cuando entra a esta pantalla, carga la sala que guardamos en DashboardScreen
    const saved = localStorage.getItem('currentSala')
    if (saved) {
      setSala(JSON.parse(saved))
    }
  }, [])

  // =====================
  // FUNCIÓN: IR A LA EXPERIENCIA
  // =====================
  const goToExperience = () => {
    if (sala) {
      // Construimos la URL: baseUrl/experiencia.html?sala=nombre-sala
      // replace(/\s+/g, '-') convierte espacios en guiones
      // toLowerCase() todo en minúsculas
      const url = getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-')
      
      // Navegamos a la URL de la experiencia
      window.location.href = url
    }
  }

  // =====================
  // FUNCIÓN: MOSTRAR MODAL DE QR
  // =====================
  const showQRModal = () => {
    setShowQR(true)
    
    // Esperamos 100ms a que se renderice el modal
    // luego generamos el código QR
    setTimeout(() => {
      // Verificamos que la librería QRCode esté disponible
      // (se carga desde CDN en experiencia.html)
      if (sala && typeof QRCode !== 'undefined') {
        const qrBox = document.getElementById('qrCodeBox')
        if (qrBox) {
          qrBox.innerHTML = ''  // Limpiamos QR anterior si existe
          
          // Construimos la URL para el QR
          const url = getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-')
          
          // Generamos el código QR
          new QRCode(qrBox, {
            text: url,                    // URL a codificar
            width: 196,                   // Ancho en px
            height: 196,                  // Alto en px
            colorDark: "#0a0a0a",         // Color de los módulos (negro)
            colorLight: "#ffffff"          // Color del fondo (blanco)
          })
        }
      }
    }, 100)
  }

  // =====================
  // FUNCIÓN: COPIAR LINK
  // =====================
  const copyLink = () => {
    // Construimos la URL
    const url = getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-')
    
    // navigator.clipboard.writeText copia el texto al portapapeles
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true)  // Mostramos "¡Copiado!"
      
      // Después de 1.5s, cerramos el modal
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
    <div 
      className="flex flex-col items-center justify-center min-h-screen w-full p-10"
      style={{
        background: sala?.image ? `url(${sala.image}) center/cover no-repeat` : sala?.color || '#000'
      }}
    >
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      
      {/* Contenido relativo para estar arriba del overlay */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
      
      {/* Botón volver atrás */}
      <button
        className="absolute top-8 left-8 text-5xl text-white bg-transparent border-none cursor-pointer hover:opacity-70"
        onClick={() => navigate('/dashboard')}
      >
        ‹
      </button>
      
      {/* Logo a la izquierda */}
      <div 
        className="absolute top-8 left-24 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center cursor-pointer"
        onClick={() => navigate('/dashboard')}
      >
        <span className="text-white font-bold text-xl">E</span>
      </div>
      
      {/* Título con el nombre de la sala */}
      <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-16 text-center">
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
          onClick={() => setShowCopy(true)}
        >
          🔗 LINK
        </button>
      </div>
      
      {/* Botón estadísticas */}
      <button
        className="mt-6 bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm py-3 px-6 rounded-lg cursor-pointer tracking-wider transition-all hover:border-green-400 hover:text-green-400"
        onClick={() => navigate('/stats', { state: { salaName: sala.name } })}
      >
        📊 ESTADÍSTICAS
      </button>

      {/* ===================== */}
      {/* MODAL: CÓDIGO QR */}
      {/* ===================== */}
      {showQR && (
        // Overlay que cubre toda la pantalla
        <div
          className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center z-[2000] p-5 overflow-y-auto"
          onClick={() => setShowQR(false)}  // Click fuera cierra
        >
          {/* Título de la sala */}
          <p
            className="text-xl text-green-400 mb-6 tracking-widest text-center"
            style={{ textShadow: '0 0 15px rgba(0, 255, 136, 0.5)' }}
          >
            {sala.name.toUpperCase()}
          </p>
          
          {/* Contenedor del QR (fondo blanco para mejor scan) */}
          <div className="bg-white rounded-xl p-3 shadow-[0_0_30px_rgba(0,255,136,0.3)] max-w-[220px] w-full">
            {/* Este div será llenado por la librería QRCode */}
            <div id="qrCodeBox"></div>
          </div>
          
          {/* Advertencia si estamos en localhost */}
          <p className="text-xs text-red-500 mt-4 tracking-wider">
            {/* Solo muestra el warning si la URL contiene 'localhost' */}
            {getBaseUrl().includes('localhost') && '⚠ localhost no funciona en celulares'}
          </p>
          
          {/* Instrucciones */}
          <p className="text-sm text-zinc-500 mt-6 tracking-wider text-center">
            ESCANEÁ PARA VIVIR LA EXPERIENCIA
          </p>
          
          {/* Link debajo del QR */}
          <p className="text-xs text-green-400 mt-2 tracking-wider text-center break-all px-5">
            {getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-')}
          </p>
        </div>
      )}

      {/* ===================== */}
      {/* MODAL: COPIAR LINK */}
      {/* ===================== */}
      {showCopy && (
        // Overlay oscuro
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-5"
          onClick={() => setShowCopy(false)}  // Click fuera cierra
        >
          {/* Botón cerrar */}
          <button
            className="absolute top-5 right-5 bg-transparent border-none text-zinc-500 text-2xl cursor-pointer hover:text-white"
            onClick={() => setShowCopy(false)}
          >
            ×
          </button>
          
          {/* Título */}
          <p className="text-green-400 tracking-widest mb-8 text-center">
            COPIAR LINK
          </p>
          
          {/* Box con el link */}
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-5">
            <p className="text-xs text-zinc-600 mb-2">Link para compartir</p>
            <p className="text-sm text-white break-all">
              {getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-')}
            </p>
          </div>
          
          {/* Botón copiar */}
          <button
            className="w-full max-w-md bg-transparent border-2 border-green-400 text-white text-base py-4 px-10 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-green-600 hover:border-green-600"
            onClick={copyLink}
          >
            COPIAR
          </button>
          
          {/* Feedback de éxito */}
          {copySuccess && (
            <p className="text-green-400 text-sm mt-3">¡Copiado!</p>
          )}
        </div>
      )}
      </div>
    </div>
  )
}
