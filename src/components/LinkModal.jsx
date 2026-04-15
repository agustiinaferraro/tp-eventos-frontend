import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBaseUrl } from '../constants'

export default function LinkModal() {
  const navigate = useNavigate()
  
  const sala = JSON.parse(localStorage.getItem('currentSala') || 'null')
  const [copySuccess, setCopySuccess] = useState(false)
  
  if (!sala) {
    navigate('/dashboard')
    return null
  }
  
  const url = getBaseUrl() + '/experiencia.html?sala=' + sala.name.toLowerCase().replace(/\s+/g, '-')
  
  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 1500)
    })
  }
  
  const goBack = () => {
    const cameFrom = localStorage.getItem('cameFrom')
    localStorage.removeItem('cameFrom')
    if (cameFrom === 'dashboard') {
      navigate('/dashboard')
    } else {
      navigate('/profiles')
    }
  }
  
  return (
    <div className="flex flex-col items-center min-h-screen w-full p-10 relative">
      {/* Fondo con brillo */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: sala?.image ? `url(${sala.image}) center/cover no-repeat` : sala?.color || '#000',
          filter: sala?.brightness ? `brightness(${sala.brightness}%)` : undefined
        }}
      />
      <div className="absolute inset-0 bg-black/70 -z-10"></div>
      
      <p className="text-green-400 tracking-widest mb-8 text-center text-xl">
        COPIAR LINK
      </p>
      
      {/* Box con el link */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-5">
        <p className="text-xs text-zinc-600 mb-2">Link para compartir</p>
        <p className="text-sm text-white break-all">
          {url}
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
      
      {/* Botón volver */}
      <button
        className="mt-8 text-zinc-500 hover:text-white"
        onClick={goBack}
      >
        ← VOLVER
      </button>
    </div>
  )
}