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
      className='text-4xl text-white bg-transparent border-none cursor-pointer hover:opacity-70'
      onClick={handleClick}
    >
      ‹
    </button>
  )
}