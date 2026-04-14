// =====================
// SalaEditScreen.jsx - Editar Sala (nombre, color, imagen)
// =====================

import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function SalaEditScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const editingIndex = location.state?.index ?? -1
  const initialSala = location.state?.sala || {}
  const isNew = editingIndex === -1
  
  const [name, setName] = useState(initialSala.name || '')
  const [color, setColor] = useState(initialSala.color || COLORS[0])
  const [image, setImage] = useState(initialSala.image || null)
  const [choseColor, setChoseColor] = useState(!!initialSala.color)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImage(ev.target.result)
      setChoseColor(false)
    }
    reader.readAsDataURL(file)
  }
  
  const handleSave = async () => {
    if (!user?.uid) {
      setError('No hay usuario logueado')
      return
    }
    
    if (!name.trim()) {
      setError('El nombre de la sala es obligatorio')
      return
    }
    
    setIsSaving(true)
    setError('')
    
    // Obtener salas actuales
    const savedSalas = localStorage.getItem('salas_' + user.uid)
    const currentProfile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
    const profileKey = currentProfile.name || 'default'
    const salas = savedSalas ? JSON.parse(savedSalas) : []
    
    const salaData = {
      name: name.trim(),
      color: choseColor ? color : (image ? null : (isNew ? color : (salas[editingIndex]?.color || COLORS[0]))),
      image: image,
      id: initialSala.id || Date.now()
    }
    
    let newSalas = [...salas]
    if (isNew) {
      newSalas.push(salaData)
    } else {
      newSalas[editingIndex] = salaData
    }
    
    // Guardar en localStorage
    localStorage.setItem('salas_' + user.uid, JSON.stringify(newSalas))
    
    // Intentar guardar en backend
    try {
      const { apiPost } = await import('../utils/api')
      await apiPost(`/api/users/${user.uid}/salas`, { salas: newSalas })
    } catch (err) {
      // Si falla el backend, ok - ya guardamos en localStorage
    }
    
    setIsSaving(false)
    navigate('/dashboard')
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-10">
      
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
      
      <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-4 text-center">
        {isNew ? 'NUEVA SALA' : 'EDITAR SALA'}
      </h1>
      
      {error && (
        <p className="text-lg text-red-400 text-center mb-4">{error}</p>
      )}
      
      {/* Preview de la sala */}
      <div 
        className="w-32 h-32 rounded-lg border-4 border-zinc-700 flex items-center justify-center text-4xl mb-6 cursor-pointer overflow-hidden"
        style={{ background: choseColor ? color : (image ? 'transparent' : color) }}
        onClick={() => document.getElementById('salaImageInput').click()}
      >
        {image ? (
          <img src={image} alt="Preview" className="w-full h-full object-cover rounded-lg" />
        ) : (
          <span className="text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>
            {name.charAt(0).toUpperCase() || '?'}
          </span>
        )}
      </div>
      
      <input
        type="file"
        id="salaImageInput"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      
      <p className="text-sm text-zinc-500 mb-8">Tocá la imagen para cambiarla</p>
      
      {/* Nombre */}
      <input
        type="text"
        className="w-full max-w-md bg-zinc-900 border-2 border-zinc-700 text-white text-center p-4 rounded-lg outline-none focus:border-green-400 placeholder-zinc-500 mb-8"
        placeholder="Nombre de la sala"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={30}
      />
      
      {/* Colores */}
      <p className="text-zinc-400 mb-4">O elegí un color:</p>
      <div className="flex gap-3 mb-8 flex-wrap justify-center">
        {COLORS.map((c) => (
          <div
            key={c}
            className={`w-10 h-10 rounded-full cursor-pointer border-2 ${color === c ? 'border-white' : 'border-transparent'}`}
            style={{ background: c }}
            onClick={() => {
              setColor(c)
              setChoseColor(true)
              setImage(null)
            }}
          />
        ))}
      </div>
      
      {/* Botón guardar */}
      <button
        className="w-full max-w-md bg-green-600 text-white py-4 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-green-500 disabled:opacity-50"
        onClick={handleSave}
        disabled={isSaving || !name.trim()}
      >
        {isSaving ? 'GUARDANDO...' : 'GUARDAR'}
      </button>
      
      {/* Botón eliminar (solo si es edición) */}
      {!isNew && (
        <button
          className="w-full max-w-md bg-transparent border-2 border-red-600 text-red-600 py-3 rounded-lg cursor-pointer tracking-wider mt-4 hover:bg-red-600 hover:text-white"
          onClick={() => {
            if (confirm('¿Eliminar esta sala?')) {
              const savedSalas = localStorage.getItem('salas_' + user.uid)
              if (savedSalas) {
                const salas = JSON.parse(savedSalas)
                salas.splice(editingIndex, 1)
                localStorage.setItem('salas_' + user.uid, JSON.stringify(salas))
              }
              navigate('/dashboard')
            }
          }}
        >
          ELIMINAR SALA
        </button>
      )}
    </div>
  )
}