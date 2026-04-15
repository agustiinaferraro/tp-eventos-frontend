// =====================
// NavBar.jsx - Barra de navegación compartida
// =====================

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, auth } from '../context/AuthContext'
import { signOut } from 'firebase/auth'

export default function NavBar({ showSearch = true, searchValue = '', onSearchChange = () => {} }) {
  const navigate = useNavigate()
  const { user, profiles, currentProfile: authCurrentProfile } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  
  const currentProfile = authCurrentProfile || JSON.parse(localStorage.getItem('currentProfile') || '{}')
  const currentSala = JSON.parse(localStorage.getItem('currentSala') || 'null')
  const savedAccounts = JSON.parse(localStorage.getItem('savedAccounts') || '[]')
  
  const handleEditCurrentProfile = () => {
    const profileToEdit = JSON.parse(localStorage.getItem('currentProfile') || '{}')
    const saved = localStorage.getItem('profiles_' + user?.uid)
    const profilesData = saved ? JSON.parse(saved) : []
    const index = profilesData.findIndex(p => p.name === profileToEdit.name)
    setShowDropdown(false)
    navigate('/profiles/edit', { state: { index: index >= 0 ? index : 0 } })
  }
  
  const handleEditSala = () => {
    setShowDropdown(false)
    if (currentSala) {
      navigate('/sala/edit', { state: { index: 0, sala: currentSala } })
    }
  }
  
  const handleSwitchAccount = async (email) => {
    await signOut(auth)
    localStorage.setItem('lastEmail', email)
    window.location.reload()
  }
  
  const handleLogout = async () => {
    setShowDropdown(false)
    await signOut(auth)
    localStorage.clear()
    navigate('/')
  }
  
  return (
    <nav className='w-full max-w-5xl flex justify-between items-center relative z-20'>
      
      {/* Logo a la izquierda */}
      <div 
        className='w-10 h-10 bg-green-600 rounded-full flex items-center justify-center cursor-pointer'
        onClick={() => navigate('/dashboard')}
      >
        <span className='text-white font-bold text-xl'>E</span>
      </div>
      
      {/* Buscador */}
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
      
      {/* Menú */}
      <div className='flex items-center gap-4 cursor-pointer relative' onClick={() => setShowDropdown(!showDropdown)}>
        <div className='w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-green-400 overflow-hidden'>
          {currentProfile?.image ? (
            <img src={currentProfile.image} alt={currentProfile.name} className='w-full h-full object-cover' />
          ) : (
            currentProfile?.name?.charAt(0).toUpperCase()
          )}
        </div>
        <span className='text-base text-zinc-300 tracking-widest'>{currentProfile?.name?.toUpperCase()}</span>
        <span className='text-zinc-500 text-xl'>▼</span>
      </div>
      
      {showDropdown && (
        <div className="absolute top-14 right-0 bg-zinc-800 border border-zinc-700 rounded-lg py-2 z-[60]">
          <button onClick={handleEditCurrentProfile} className="w-full px-5 py-3 text-white hover:bg-zinc-700 text-left">
            EDITAR PERFIL
          </button>
          <button onClick={handleEditSala} className="w-full px-5 py-3 text-white hover:bg-zinc-700 text-left">
            EDITAR SALA
          </button>
          <button onClick={() => { setShowDropdown(false); setShowSwitchModal(true) }} className="w-full px-5 py-3 text-white hover:bg-zinc-700 text-left">
            CAMBIAR CUENTA
          </button>
          <button onClick={handleLogout} className="w-full px-5 py-3 text-white hover:bg-zinc-700 text-left">
            CERRAR SESIÓN
          </button>
        </div>
      )}
      
      {showSwitchModal && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-5" onClick={() => setShowSwitchModal(false)}>
          <button className="absolute top-5 right-5 text-zinc-500 text-2xl" onClick={() => setShowSwitchModal(false)}>×</button>
          <p className="text-3xl text-green-400 tracking-widest mb-10">CAMBIAR CUENTA</p>
          <div className="w-full max-w-md">
            {savedAccounts.map((email, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer hover:border-green-400 mb-3" onClick={() => handleSwitchAccount(email)}>
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-green-400">{email.charAt(0).toUpperCase()}</div>
                <div><p className="text-sm text-white">{email}</p><p className="text-xs text-zinc-500">Tocá para cambiar</p></div>
              </div>
            ))}
            <button className="w-full max-w-md bg-transparent border-2 border-white text-white py-4 mt-4" onClick={async () => { await signOut(auth); localStorage.removeItem('savedAccounts'); navigate('/') }}>
              Cerrar todas las sesiones
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}