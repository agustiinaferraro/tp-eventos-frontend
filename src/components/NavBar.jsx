// =====================
// NavBar.jsx - Barra de navegación compartida
// =====================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar({ showSearch = false, searchValue = '', onSearchChange = () => {}, profiles = [], onSwitchAccount = () => {} }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  
  const currentProfile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
  const currentSala = JSON.parse(localStorage.getItem('currentSala') || 'null')
  
  const handleEditCurrentProfile = () => {
    const currentProfileData = JSON.parse(localStorage.getItem('currentProfile') || '{}')
    const index = profiles.findIndex(p => p.name === currentProfileData.name)
    setShowDropdown(false)
    navigate('/profiles/edit', { state: { index: index >= 0 ? index : 0 } })
  }
  
  const handleEditSala = () => {
    setShowDropdown(false)
    if (currentSala) {
      navigate('/sala/edit', { state: { index: 0, sala: currentSala } })
    }
  }
  
  return (
    <nav className='w-full max-w-5xl flex justify-between items-center relative z-20'>
      
      {/* Logo a la izquierda (clickeable -> Dashboard) */}
      <div 
        className='w-10 h-10 bg-green-600 rounded-full flex items-center justify-center cursor-pointer'
        onClick={() => navigate('/dashboard')}
      >
        <span className='text-white font-bold text-xl'>E</span>
      </div>
      
      {/* Buscador de salas (CENTRADO) - solo si showSearch es true */}
      {showSearch && (
        <div className='flex-1 max-w-xs mx-4'>
          <div className='relative'>
            <svg className='absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
            <input
              type='text'
              className='w-full bg-zinc-900 border border-zinc-700 text-white pl-8 p-2 rounded-lg outline-none focus:border-green-400 placeholder-zinc-500 text-sm'
              placeholder='Buscar sala...'
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      )}
      
      {/* Menú del usuario (A LA DERECHA) */}
      <div
        className='flex items-center gap-4 cursor-pointer relative'
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className='w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-green-400 overflow-hidden'>
          {currentProfile?.image ? (
            <img src={currentProfile.image} alt={currentProfile.name} className='w-full h-full object-cover' />
          ) : (
            currentProfile?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <span className='text-base text-zinc-300 tracking-widest'>
          {currentProfile?.name?.toUpperCase()}
        </span>
        <span className='text-zinc-500 text-xl'>▼</span>
        
        {showDropdown && (
          <div className='absolute top-full right-0 mt-4 bg-zinc-800 border border-zinc-700 rounded-lg py-2 min-w-48 z-50 shadow-xl'>
            <div
              className='px-5 py-3 text-white cursor-pointer hover:bg-zinc-700 tracking-wider text-center border border-zinc-700 rounded-md mx-2 mb-2 flex items-center justify-center gap-2'
              onClick={handleEditCurrentProfile}
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
              </svg>
              Editar perfil
            </div>
            {currentSala && (
              <div
                className='px-5 py-3 text-white cursor-pointer hover:bg-zinc-700 tracking-wider text-center border border-zinc-700 rounded-md mx-2 mb-2 flex items-center justify-center gap-2'
                onClick={handleEditSala}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                </svg>
                Editar sala
              </div>
            )}
            <div
              className='px-5 py-3 text-white cursor-pointer hover:bg-zinc-700 tracking-wider text-center border border-zinc-700 rounded-md mx-2 mb-2'
              onClick={() => {
                setShowDropdown(false)
                onSwitchAccount()
              }}
            >
              Cambiar cuenta
            </div>
            <div
              className='px-5 py-3 text-white cursor-pointer hover:bg-zinc-700 tracking-wider text-center'
              onClick={() => {
                setShowDropdown(false)
                navigate('/')
                localStorage.clear()
              }}
            >
              Cerrar sesión
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}