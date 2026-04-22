import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBaseUrl } from '../constants'
import BackButton from './BackButton'

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
      
      <div className="pointer-events-none w-full max-w-5xl">
        <BackButton onClick={() => navigate('/sala')} />
      </div>
      
      <p className="text-green-400 tracking-widest mb-8 text-center text-xl mt-8 relative z-10">
        COPIAR LINK
      </p>
      
      {/* Box con el link */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-5 relative z-10">
        <p className="text-xs text-zinc-600 mb-2">Link para compartir</p>
        <p className="text-sm text-white break-all">
          {url}
        </p>
      </div>
      
      {/* Botón copiar */}
      <button
        className="w-full max-w-md bg-transparent border-2 border-green-400 text-white text-base py-4 px-10 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-green-600 hover:border-green-600 relative z-10"
        onClick={copyLink}
      >
        COPIAR
      </button>
      
      {/* Feedback de éxito */}
      {copySuccess && (
        <p className="text-green-400 text-sm mt-3 relative z-10">¡Copiado!</p>
      )}
    </div>
  )
}