// =====================
// ExperienceEditScreen.jsx - Personalizar experiencia de sala
// =====================

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BackButton from './BackButton'
import { apiGetExperience, apiSaveExperience } from '../utils/api'
import { getBaseUrl } from '../constants'

const LEVELS = [
  { key: 'level0', min: 0, max: 499, label: '0-499' },
  { key: 'level1', min: 500, max: 999, label: '500-999' },
  { key: 'level2', min: 1000, max: 1000, label: '1000' }
]

export default function ExperienceEditScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const iframeRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sala, setSala] = useState(null)
  const [previewPoints, setPreviewPoints] = useState(0)
  const [showControls, setShowControls] = useState(false)
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

  useEffect(() => {
    if (iframeRef.current) {
      const currentLevel = getLevelForPoints(previewPoints)
      const config = {
        points: previewPoints,
        room: sala?.name || 'test',
        experience: experience,
        currentLevel: currentLevel
      }
      try {
        iframeRef.current.contentWindow?.postMessage(
          { type: 'EXPERIENCE_PREVIEW', config },
          '*'
        )
      } catch (e) {}
    }
  }, [previewPoints, experience, sala])

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

  const currentLevel = getLevelForPoints(previewPoints)
  const currentLvl = experience[currentLevel]
  const experienceUrl = sala ? `${getBaseUrl()}/experiencia.html?sala=${sala.name.toLowerCase().replace(/\s+/g, '-')}` : ''

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0">
        <iframe
          ref={iframeRef}
          src={experienceUrl}
          className="w-full h-full border-0"
          title="Preview experiencia"
          allow="accelerometer"
        />
      </div>

      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed top-16 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg"
      >
        {showControls ? '✕' : '⚙️'}
      </button>

      {showControls && (
      <div className="fixed inset-0 z-40 bg-black bg-opacity-90 overflow-y-auto p-4">
        <div className="max-w-md mx-auto bg-zinc-900 rounded-xl p-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-2">
            <span>0</span>
            <span>500</span>
            <span>1000</span>
          </div>
          
          <input
            type="range"
            min="0"
            max="1000"
            value={previewPoints}
            onChange={(e) => setPreviewPoints(parseInt(e.target.value))}
            className="w-full h-3 bg-zinc-700 rounded-lg"
            style={{ accentColor: currentLvl.color }}
          />
          
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-zinc-400">
              {previewPoints} pts — {LEVELS.find(l => l.key === currentLevel)?.label}
            </span>
            <span 
              className="px-3 py-1 rounded text-sm font-bold"
              style={{ backgroundColor: currentLvl.color, color: '#000' }}
            >
              {currentLevel === 'level0' ? 'Nivel 1' : currentLevel === 'level1' ? 'Nivel 2' : 'Nivel 3'}
            </span>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl p-4">
          <h2 className="text-base text-white mb-3 flex items-center gap-2">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: currentLvl.color }} />
            Editando: {LEVELS.find(l => l.key === currentLevel)?.label} pts
          </h2>
          
          <div className="mb-3">
            <label className="block text-zinc-400 text-sm mb-1">Color de barra</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={currentLvl.color}
                onChange={(e) => updateLevel(currentLevel, 'color', e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-2 border-zinc-700"
              />
              <input
                type="text"
                value={currentLvl.color}
                onChange={(e) => updateLevel(currentLevel, 'color', e.target.value)}
                className="flex-1 bg-zinc-800 text-white p-2 rounded-lg font-mono text-sm"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-zinc-400 text-sm mb-1">Mensaje motivacional</label>
            <input
              type="text"
              value={currentLvl.message}
              onChange={(e) => updateLevel(currentLevel, 'message', e.target.value)}
              maxLength={30}
              className="w-full bg-zinc-800 text-white p-2 rounded-lg text-sm"
            />
          </div>

          <div className="mb-3">
            <label className="block text-zinc-400 text-sm mb-1">Color de fondo</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={currentLvl.background || '#000000'}
                onChange={(e) => updateLevel(currentLevel, 'background', e.target.value)}
                className="w-12 h-12 rounded cursor-pointer border-2 border-zinc-700"
              />
              <button
                onClick={() => updateLevel(currentLevel, 'background', null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-sm hover:bg-zinc-700"
              >
                Sin color
              </button>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-zinc-400 text-sm mb-1">Imagen de fondo (URL)</label>
            <input
              type="text"
              value={currentLvl.backgroundImage || ''}
              onChange={(e) => updateLevel(currentLevel, 'backgroundImage', e.target.value)}
              placeholder="https://..."
              className="w-full bg-zinc-800 text-white p-2 rounded-lg text-sm"
            />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <label className="text-zinc-400 text-sm">Partículas activas</label>
            <button
              onClick={() => updateLevel(currentLevel, 'particles', !currentLvl.particles)}
              className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${
                currentLvl.particles ? 'bg-green-600' : 'bg-zinc-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                currentLvl.particles ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

        <div className="bg-zinc-900 rounded-xl p-4 mt-3">
          <h2 className="text-base text-white mb-3">Efectos globales</h2>
          
          <div className="mb-3">
            <label className="block text-zinc-400 text-sm mb-1">
              Partículas: {experience.effects.particleCount}
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
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 text-white py-3 rounded-xl mt-4 tracking-wider hover:bg-green-500 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'GUARDAR Y SALIR'}
        </button>
      </div>
      )}
    </div>
  )
}