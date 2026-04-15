// =====================
// SalaEditScreen.jsx - Editar Sala (nombre, color, imagen)
// =====================

import React, { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

import NavBar from './NavBar'
import BackButton from './BackButton'

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function SalaEditScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const fileInputRef = useRef(null)
  
  const editingIndex = location.state?.index ?? -1
  const initialSala = location.state?.sala || {}
  const isNew = editingIndex === -1
  
  const [name, setName] = useState(initialSala.name || '')
  const [color, setColor] = useState(initialSala.color || COLORS[0])
  const [image, setImage] = useState(initialSala.image || null)
  const [choseColor, setChoseColor] = useState(!!initialSala.color)
  const [brightness, setBrightness] = useState(initialSala.brightness ?? 100)
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
  
  const handleCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })
      
      const video = document.createElement('video')
      video.srcObject = stream
      video.className = 'fixed top-0 left-0 w-full h-full z-[9999] bg-black object-cover'
      video.play()
      document.body.appendChild(video)
      
      const captureBtn = document.createElement('button')
      captureBtn.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-20 h-20 rounded-full bg-white border-none cursor-pointer text-4xl'
      captureBtn.textContent = '📷'
      document.body.appendChild(captureBtn)
      
      const closeBtn = document.createElement('button')
      closeBtn.className = 'fixed top-5 right-5 z-[10001] w-12 h-12 rounded-full bg-white/20 text-white text-xl border-none cursor-pointer'
      closeBtn.textContent = '✕'
      document.body.appendChild(closeBtn)
      
      let currentPhoto = null
      
      const cleanup = () => {
        stream.getTracks().forEach(t => t.stop())
        document.body.removeChild(video)
        document.body.removeChild(captureBtn)
        document.body.removeChild(closeBtn)
        if (currentPhoto) {
          document.body.removeChild(currentPhoto.canvas)
          document.body.removeChild(currentPhoto.confirmBtn)
          document.body.removeChild(currentPhoto.cancelBtn)
        }
      }
      
      closeBtn.onclick = cleanup
      
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)
        
        currentPhoto = {
          canvas: canvas,
          dataUrl: canvas.toDataURL('image/jpeg')
        }
        
        video.style.display = 'none'
        captureBtn.style.display = 'none'
        
        canvas.className = 'fixed top-0 left-0 w-full h-full z-[9999] bg-black object-cover'
        document.body.appendChild(canvas)
        
        const confirmBtn = document.createElement('button')
        confirmBtn.className = 'fixed bottom-10 right-10 z-[10001] w-16 h-16 rounded-full bg-green-600 border-none cursor-pointer text-white text-3xl'
        confirmBtn.textContent = '✓'
        document.body.appendChild(confirmBtn)
        
        const cancelBtn = document.createElement('button')
        cancelBtn.className = 'fixed bottom-10 left-10 z-[10001] w-16 h-16 rounded-full bg-red-600 border-none cursor-pointer text-white text-3xl'
        cancelBtn.textContent = '✕'
        document.body.appendChild(cancelBtn)
        
        confirmBtn.onclick = () => {
          setChoseColor(false)
          setImage(currentPhoto.dataUrl)
          cleanup()
        }
        
        cancelBtn.onclick = () => {
          document.body.removeChild(canvas)
          document.body.removeChild(confirmBtn)
          document.body.removeChild(cancelBtn)
          currentPhoto = null
          video.style.display = 'block'
          captureBtn.style.display = 'block'
        }
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara')
    }
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
    
    const currentProfile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
    const profileKey = currentProfile.name || 'default'
    const savedSalas = localStorage.getItem('salas_' + user.uid + '_' + profileKey)
    const salas = savedSalas ? JSON.parse(savedSalas) : []
    
    const salaData = {
      name: name.trim(),
      color: choseColor ? color : (image ? null : (isNew ? color : (salas[editingIndex]?.color || COLORS[0]))),
      image: image,
      brightness: brightness,
      id: initialSala.id || Date.now()
    }
    
    let newSalas = [...salas]
    if (isNew) {
      newSalas.push(salaData)
    } else {
      newSalas[editingIndex] = salaData
    }
    
    localStorage.setItem('salas_' + user.uid + '_' + profileKey, JSON.stringify(newSalas))
    
    try {
      const { apiPost } = await import('../utils/api')
      await apiPost(`/api/users/${user.uid}/salas`, { salas: newSalas })
    } catch (err) {}
    
    setIsSaving(false)
    localStorage.setItem('currentSala', JSON.stringify(salaData))
    navigate('/sala')
  }
  
return (
    <div className='flex flex-col items-center min-h-screen w-full p-10 relative'>
      {/* Fondo con brillo */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: image ? `url(${image}) center/cover no-repeat` : (choseColor ? color : '#000'),
          filter: `brightness(${brightness}%)`
        }}
      />
      
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/70 -z-10"></div>
      
      <NavBar />
      <BackButton onClick={() => navigate('/dashboard')} />
      
      <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-4 text-center relative z-10">
        {isNew ? 'NUEVA SALA' : 'EDITAR SALA'}
      </h1>
      
      {error && (
        <p className="text-lg text-red-400 text-center mb-4 relative z-10">{error}</p>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      
      {/* Botones de imagen y cámara */}
      <div className="flex gap-4 mb-8 relative z-10">
        <button
          className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm"
          onClick={() => fileInputRef.current?.click()}
        >
          📁 Galería
        </button>
        <button
          className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm"
          onClick={handleCamera}
        >
          📷 Cámara
        </button>
      </div>
      
      {image && (
        <button
          className="text-zinc-500 text-sm mb-4 hover:text-white relative z-10"
          onClick={() => {
            setImage(null)
            setChoseColor(true)
          }}
        >
          Quitar imagen
        </button>
      )}
      
      {/* Control de brillo - tanto para imagen como para color */}
      {(image || choseColor) && (
        <div className="w-full max-w-md mb-8 relative z-10">
          <p className="text-zinc-400 mb-2 text-center">Brillo</p>
          <input
            type="range"
            min="20"
            max="150"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>Más oscuro</span>
            <span>Más claro</span>
          </div>
        </div>
      )}
      
      {/* Nombre */}
      <input
        type="text"
        className="w-full max-w-md bg-zinc-900/80 border-2 border-zinc-700 text-white text-center p-4 rounded-lg outline-none focus:border-green-400 placeholder-zinc-500 mb-8 relative z-10"
        placeholder="Nombre de la sala"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={30}
      />
      
      {/* Colores */}
      <p className="text-zinc-400 mb-4 relative z-10">O elegí un color:</p>
      <div className="flex gap-3 mb-8 flex-wrap justify-center relative z-10">
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
        className="w-full max-w-md bg-green-600 text-white py-4 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-green-500 disabled:opacity-50 relative z-10"
        onClick={handleSave}
        disabled={isSaving || !name.trim()}
      >
        {isSaving ? 'GUARDANDO...' : 'GUARDAR'}
      </button>
      
      {!isNew && (
        <button
          className="w-full max-w-md bg-transparent border-2 border-red-600 text-red-600 py-3 rounded-lg cursor-pointer tracking-wider mt-4 hover:bg-red-600 hover:text-white relative z-10"
          onClick={() => {
            if (confirm('¿Eliminar esta sala?')) {
              const savedSalas = localStorage.getItem('salas_' + user.uid + '_' + profileKey)
              if (savedSalas) {
                const salas = JSON.parse(savedSalas)
                salas.splice(editingIndex, 1)
                localStorage.setItem('salas_' + user.uid + '_' + profileKey, JSON.stringify(salas))
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