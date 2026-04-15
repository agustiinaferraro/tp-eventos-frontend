// =====================
// QRModal.jsx - Modal de Código QR
// =====================

import React, { useEffect } from 'react'
import { getBaseUrl } from '../constants'

export default function QRModal({ sala, show, onClose }) {
  useEffect(() => {
    if (show && sala) {
      setTimeout(() => {
        const qrBox = document.getElementById('qrCodeBox')
        if (qrBox && typeof QRCode !== 'undefined') {
          qrBox.innerHTML = ''
          const url = getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-')
          new QRCode(qrBox, {
            text: url,
            width: 196,
            height: 196,
            colorDark: "#0a0a0a",
            colorLight: "#ffffff"
          })
        }
      }, 100)
    }
  }, [show, sala])
  
  if (!show) return null
  
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-[2000] p-5 overflow-y-auto"
      onClick={onClose}
    >
      {/* Fondo con brillo */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: sala?.image ? `url(${sala.image}) center/cover no-repeat` : sala?.color || '#000',
          filter: sala?.brightness ? `brightness(${sala.brightness}%)` : undefined
        }}
      />
      <div className="absolute inset-0 bg-black/70 -z-10"></div>
      
      {/* Título de la sala */}
      <p
        className="text-xl text-green-400 mb-6 tracking-widest text-center"
        style={{ textShadow: '0 0 15px rgba(0, 255, 136, 0.5)' }}
      >
        {sala.name.toUpperCase()}
      </p>
      
      {/* Contenedor del QR (fondo blanco para mejor scan) */}
      <div className="bg-white rounded-xl p-3 shadow-[0_0_30px_rgba(0,255,136,0.3)] max-w-[220px] w-full">
        <div id="qrCodeBox"></div>
      </div>
      
      {/* Advertencia si estamos en localhost */}
      <p className="text-xs text-red-500 mt-4 tracking-wider">
        {getBaseUrl().includes('localhost') && '⚠ localhost no funciona en celulares'}
      </p>
      
      {/* Instrucciones */}
      <p className="text-sm text-zinc-500 mt-6 tracking-wider text-center">
        ESCANEÁ PARA VIVIR LA EXPERIENCIA
      </p>
      
      {/* Link debajo del QR */}
      <p className="text-xs text-green-400 mt-2 tracking-widest text-center break-all px-5">
        {getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-')}
      </p>
    </div>
  )
}

export function showQRCode(sala) {
  setTimeout(() => {
    if (sala && typeof QRCode !== 'undefined') {
      const qrBox = document.getElementById('qrCodeBox')
      if (qrBox) {
        qrBox.innerHTML = ''
        const url = getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-')
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