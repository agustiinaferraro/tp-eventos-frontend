// =====================
// BackButton.jsx - Botón de volver atrás
// =====================

import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function BackButton({ onClick }) {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      navigate(-1)
    }
  }
  
  return (
    <button
      className='absolute text-5xl text-white bg-transparent border-none cursor-pointer hover:opacity-70 active:opacity-50 hover:scale-110 active:scale-90 transition-transform z-20'
      style={{ left: '2rem', top: '6rem' }}
      onClick={handleClick}
    >
      ‹
    </button>
  )
}