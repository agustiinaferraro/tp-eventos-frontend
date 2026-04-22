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
          const url =
            getBaseUrl() +
            '/experiencia.html?sala=' +
            sala.name.toLowerCase().replace(/\s+/g, '-')

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

  const url =
    getBaseUrl() +
    '/experiencia.html?sala=' +
    sala.name.toLowerCase().replace(/\s+/g, '-')

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[2000] p-5"
      onClick={onClose}
    >
      {/* Overlay borroso */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>

      {/* Contenido */}
      <div
        className="relative z-10 flex flex-col items-center text-center p-6 rounded-2xl bg-black/40 backdrop-blur-lg border border-white/10 shadow-xl max-w-xs w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Título */}
        <p className="text-xl text-green-400 mb-6 tracking-widest">
          {sala.name.toUpperCase()}
        </p>

        {/* QR */}
        <div className="bg-white rounded-xl p-3 shadow-lg">
          <div id="qrCodeBox"></div>
        </div>

        {/* Advertencia */}
        {getBaseUrl().includes('localhost') && (
          <p className="text-xs text-red-500 mt-4 tracking-wider">
            ⚠ localhost no funciona en celulares
          </p>
        )}

        {/* Instrucciones */}
        <p className="text-sm text-zinc-400 mt-6 tracking-wider">
          ESCANEÁ PARA VIVIR LA EXPERIENCIA
        </p>

        {/* Link */}
        <p className="text-xs text-green-400 mt-2 tracking-widest break-all">
          {url}
        </p>
      </div>
    </div>
  )
}

export function showQRCode(sala) {
  setTimeout(() => {
    if (sala && typeof QRCode !== 'undefined') {
      const qrBox = document.getElementById('qrCodeBox')
      if (qrBox) {
        qrBox.innerHTML = ''
        const url =
          getBaseUrl() +
          '/experiencia.html?sala=' +
          sala.name.toLowerCase().replace(/\s+/g, '-')

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