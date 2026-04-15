// =====================
// BackButton.jsx - Botón de volver atrás
// =====================

import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function BackButton({ onClick, className = '' }) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(-1)
    }
  }
  
  return (
    <div className={'w-full max-w-5xl flex justify-between items-center relative z-20' + (className ? ' ' + className : '')} style={{ marginTop: '1rem' }}>
      <button
        className='text-6xl text-white bg-transparent border-none cursor-pointer hover:opacity-70 active:opacity-50 hover:scale-110 active:scale-90 transition-transform ml-2 pointer-events-auto'
        onClick={handleClick}
      >
        ‹
      </button>
    </div>
  )
}