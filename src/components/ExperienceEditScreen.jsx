// =====================
// ExperienceEditScreen.jsx - Personalizar experiencia de sala
// =====================

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NavBar from './NavBar'
import BackButton from './BackButton'
import { apiGetExperience, apiSaveExperience } from '../utils/api'

const LEVELS = [
  { key: 'level0', min: 0, max: 499, label: '0-499', className: 'orange' },
  { key: 'level1', min: 500, max: 999, label: '500-999', className: 'yellow' },
  { key: 'level2', min: 1000, max: 1000, label: '1000', className: 'green' }
]

export default function ExperienceEditScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sala, setSala] = useState(null)
  const [currentPoints, setCurrentPoints] = useState(0)
  const [experience, setExperience] = useState({
    level0: { color: '#ff6b00', background: null, backgroundImage: null, particles: true, message: '¡Sumá tu energía!' },
    level1: { color: '#ffdd00', background: null, backgroundImage: null, particles: true, message: '¡Casi llegamos!' },
    level2: { color: '#00ff88', background: null, backgroundImage: null, particles: true, message: '¡Nivel máximo!' },
    effects: { particleCount: 40, showGestures: true, showNearThreshold: true }
  })

  useEffect(() => {
    const savedSala = location.state?.sala
    if (savedSala) {
      setSala(savedSala)
      loadExperience(savedSala.name)
    } else {
      setLoading(false)
    }
  }, [])

  async function loadExperience(salaName) {
    try {
      const data = await apiGetExperience(salaName)
      setExperience(data.experience)
    } catch (err) {
      console.error('Error cargando experiencia:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!sala) return
    setSaving(true)
    try {
      await apiSaveExperience(sala.name, experience)
      navigate('/sala')
    } catch (err) {
      console.error('Error guardando experiencia:', err)
    } finally {
      setSaving(false)
    }
  }

  function getLevelForPoints(points) {
    if (points >= 1000) return 'level2'
    if (points >= 500) return 'level1'
    return 'level0'
  }

  function updateLevel(key, field, value) {
    setExperience(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value }
    }))
  }

  function updateEffects(field, value) {
    setExperience(prev => ({
      ...prev,
      effects: { ...prev.effects, [field]: value }
    }))
  }

  function handleBack() {
    if (sala) {
      navigate('/sala', { state: { sala } })
    } else {
      navigate('/dashboard')
    }
  }

  function getBarColor(points) {
    if (points >= 1000) return experience.level2.color
    if (points >= 500) return experience.level1.color
    return experience.level0.color
  }

  function getProgressWidth(points) {
    return Math.min(points / 1000 * 100, 100) + '%'
  }

  const currentLevel = getLevelForPoints(currentPoints)
  const currentLvl = experience[currentLevel]
  const bgColor = currentLvl.background || '#000'
  const bgImage = currentLvl.backgroundImage

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <NavBar currentProfile={null} onMenuAction={() => {}} />
      
      <div className="max-w-2xl mx-auto p-4 pt-20">
        <BackButton onClick={handleBack} />
        
        <h1 className="text-2xl text-green-400 tracking-wider mt-4 mb-6">
          PERSONALIZAR EXPERIENCIA
        </h1>

        {/* ================================================ */}
        {/* PREVIEW - IDENTICO A LA EXPERIENCIA REAL */}
        {/* ================================================ */}
        <div 
          className="flex flex-col items-center justify-center min-h-[60vh]"
          style={{
            backgroundColor: bgColor,
            backgroundImage: bgImage ? `url(${bgImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Título */}
          <p className="text-3xl md:text-5xl font-bold mb-4 text-white">
            {sala?.name?.toUpperCase() || 'Evento'}
          </p>

          {/* Puntos */}
          <div 
            id="points" 
            className="text-6xl md:text-8xl font-bold mb-2"
            style={{ color: currentLvl.color }}
          >
            {currentPoints}
          </div>
          <p className="text-lg text-white mb-4">puntos</p>
          
          <p className="text-lg text-gray-400 text-center px-5 mb-4">
            {currentLvl.message}
          </p>

          {/* Indicador de movimiento */}
          <div className="text-sm text-gray-400">
            📱 Mueva el teléfono
          </div>

          {/* Barra de progreso */}
          <div className="w-full max-w-md mt-8 mb-8 px-4">
            {/* Etiquetas */}
            <div className="relative h-6 mb-1">
              <span className="absolute text-xs text-gray-500" style={{ left: '0%' }}>0</span>
              <span className="absolute text-xs text-gray-500" style={{ left: '12%' }}>125</span>
              <span className="absolute text-xs text-gray-500" style={{ left: '25%' }}>250</span>
              <span className="absolute text-xs text-gray-500" style={{ left: '37%' }}>375</span>
              <span className="absolute text-xs text-gray-500" style={{ left: '62%' }}>625</span>
              <span className="absolute text-xs text-gray-500" style={{ left: '75%' }}>750</span>
              <span className="absolute text-xs text-gray-500" style={{ left: '87%' }}>875</span>
              <span className="absolute text-xs text-gray-500" style={{ right: '0%' }}>1000</span>
            </div>
            
            {/* Barra */}
            <div className="h-2 bg-neutral-900 rounded">
              <div 
                className="h-full rounded transition-all"
                style={{ 
                  width: getProgressWidth(currentPoints),
                  backgroundColor: getBarColor(currentPoints)
                }}
              />
            </div>
          </div>

          {/* Partículas (decorativo) */}
          {currentLvl.particles && (
            <div className="text-green-400/30 text-xs mt-4">
              ✦ ✦ ✦ partículas
            </div>
          )}
        </div>

        {/* ================================================ */}
        {/* SCRUBBER */}
        {/* ================================================ */}
        <div className="bg-zinc-900 rounded-xl p-4 my-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>0</span>
            <span>500</span>
            <span>1000</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="1000"
            value={currentPoints}
            onChange={(e) => setCurrentPoints(parseInt(e.target.value))}
            className="w-full h-3 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: currentLvl.color }}
          />
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-zinc-400">
              {currentPoints} pts — {LEVELS.find(l => l.key === currentLevel)?.label}
            </span>
            <span 
              className="px-3 py-1 rounded text-sm font-bold"
              style={{ backgroundColor: currentLvl.color, color: '#000' }}
            >
              {currentLevel === 'level0' ? 'Nivel 1' : currentLevel === 'level1' ? 'Nivel 2' : 'Nivel 3'}
            </span>
          </div>
        </div>

        {/* ================================================ */}
        {/* PANEL DE EDICIÓN */}
        {/* ================================================ */}
        <div className="bg-zinc-900 rounded-xl p-5">
          <h2 className="text-lg text-white mb-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: currentLvl.color }} />
            Editando: {LEVELS.find(l => l.key === currentLevel)?.label} pts
          </h2>
          
          {/* Color de barra */}
          <div className="mb-4">
            <label className="block text-zinc-400 text-sm mb-2">Color de barra</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={currentLvl.color}
                onChange={(e) => updateLevel(currentLevel, 'color', e.target.value)}
                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-zinc-700"
              />
              <input
                type="text"
                value={currentLvl.color}
                onChange={(e) => updateLevel(currentLevel, 'color', e.target.value)}
                className="flex-1 bg-zinc-800 text-white p-3 rounded-lg font-mono"
              />
            </div>
          </div>

          {/* Mensaje */}
          <div className="mb-4">
            <label className="block text-zinc-400 text-sm mb-2">Mensaje motivacional</label>
            <input
              type="text"
              value={currentLvl.message}
              onChange={(e) => updateLevel(currentLevel, 'message', e.target.value)}
              maxLength={30}
              className="w-full bg-zinc-800 text-white p-3 rounded-lg"
              placeholder="Escribí el mensaje..."
            />
          </div>

          {/* Fondo color */}
          <div className="mb-4">
            <label className="block text-zinc-400 text-sm mb-2">Color de fondo</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={currentLvl.background || '#000000'}
                onChange={(e) => updateLevel(currentLevel, 'background', e.target.value)}
                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-zinc-700"
              />
              <button
                onClick={() => updateLevel(currentLevel, 'background', null)}
                className="px-4 py-3 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700"
              >
                Sin color
              </button>
            </div>
          </div>

          {/* Imagen de fondo */}
          <div className="mb-4">
            <label className="block text-zinc-400 text-sm mb-2">Imagen de fondo (URL)</label>
            <input
              type="text"
              value={currentLvl.backgroundImage || ''}
              onChange={(e) => updateLevel(currentLevel, 'backgroundImage', e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full bg-zinc-800 text-white p-3 rounded-lg"
            />
            {currentLvl.backgroundImage && (
              <img 
                src={currentLvl.backgroundImage} 
                alt="Preview" 
                className="mt-2 w-full h-24 object-cover rounded-lg"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>

          {/* Partículas */}
          <div className="mb-4 flex items-center justify-between">
            <label className="text-zinc-400 text-sm">Partículas activas</label>
            <button
              onClick={() => updateLevel(currentLevel, 'particles', !currentLvl.particles)}
              className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${
                currentLvl.particles ? 'bg-green-600' : 'bg-zinc-700'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                currentLvl.particles ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>

        {/* ================================================ */}
        {/* EFECTOS GLOBALES */}
        {/* ================================================ */}
        <div className="bg-zinc-900 rounded-xl p-5 mt-4">
          <h2 className="text-lg text-white mb-4">Efectos globales</h2>
          
          <div className="mb-4">
            <label className="block text-zinc-400 text-sm mb-2">
              Cantidad de partículas: {experience.effects.particleCount}
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={experience.effects.particleCount}
              onChange={(e) => updateEffects('particleCount', parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <label className="text-zinc-400 text-sm">Mostrar gestos</label>
              <button
                onClick={() => updateEffects('showGestures', !experience.effects.showGestures)}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                  experience.effects.showGestures ? 'bg-green-600' : 'bg-zinc-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  experience.effects.showGestures ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-zinc-400 text-sm">Mostrar near threshold</label>
              <button
                onClick={() => updateEffects('showNearThreshold', !experience.effects.showNearThreshold)}
                className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                  experience.effects.showNearThreshold ? 'bg-green-600' : 'bg-zinc-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  experience.effects.showNearThreshold ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 text-white py-4 rounded-xl mt-6 tracking-wider text-lg hover:bg-green-500 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'GUARDAR CAMBIOS'}
        </button>
      </div>
    </div>
  )
}