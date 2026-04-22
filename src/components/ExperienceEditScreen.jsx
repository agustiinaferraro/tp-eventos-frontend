// =====================
// ExperienceEditScreen.jsx - Personalizar experiencia de sala
// =====================

import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BackButton from './BackButton'
import { apiGetExperience, apiSaveExperience } from '../utils/api'
import { getBaseUrl } from '../constants'

const LEVELS = [
  { key: 'level0', min: 0, max: 499, label: 'Nivel 1' },
  { key: 'level1', min: 500, max: 999, label: 'Nivel 2' },
  { key: 'level2', min: 1000, max: 1000, label: 'Nivel 3' }
]

export default function ExperienceEditScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const iframeRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sala, setSala] = useState(null)
  const [previewPoints, setPreviewPoints] = useState(0)
  const [showBgMenu, setShowBgMenu] = useState(false)
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
      <div className="h-screen bg-black flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={experienceUrl}
          className="w-full h-full border-0"
          title="Preview experiencia"
          allow="accelerometer"
        />
      </div>

      <div className="flex-shrink-0 bg-zinc-900 border-t border-zinc-800 overflow-y-auto" style={{ maxHeight: '45vh' }}>
        <div className="p-3 space-y-3">
          <div className="bg-zinc-800 rounded-lg p-2">
            <input
              type="range"
              min="0"
              max="1000"
              value={previewPoints}
              onChange={(e) => setPreviewPoints(parseInt(e.target.value))}
              className="w-full h-2"
              style={{ accentColor: currentLvl.color }}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-zinc-500">0</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ backgroundColor: currentLvl.color, color: '#000' }}>
                {previewPoints} pts
              </span>
              <span className="text-xs text-zinc-500">1000</span>
            </div>
            <div className="flex justify-center mt-1">
              <span className="text-xs text-zinc-400">{LEVELS.find(l => l.key === currentLevel)?.label}</span>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap items-end">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Color</label>
              <input
                type="color"
                value={currentLvl.color}
                onChange={(e) => updateLevel(currentLevel, 'color', e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-zinc-700"
              />
            </div>

            <div className="relative">
              <label className="text-xs text-zinc-500 block mb-1">Fondo</label>
              <button
                onClick={() => setShowBgMenu(!showBgMenu)}
                className="w-12 h-12 rounded-lg border-2 border-zinc-700 bg-zinc-800 flex items-center justify-center text-2xl"
              >
                🖼️
              </button>
              {showBgMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-zinc-800 rounded-lg p-2 shadow-lg z-10 w-36">
                  <button
                    onClick={() => setShowBgMenu(false)}
                    className="block w-full text-left text-xs text-zinc-300 hover:bg-zinc-700 p-2 rounded"
                  >
                    IA
                  </button>
                  <button
                    onClick={() => setShowBgMenu(false)}
                    className="block w-full text-left text-xs text-zinc-300 hover:bg-zinc-700 p-2 rounded"
                  >
                    Galería
                  </button>
                  <button
                    onClick={() => { updateLevel(currentLevel, 'background', '#000'); setShowBgMenu(false) }}
                    className="block w-full text-left text-xs text-zinc-300 hover:bg-zinc-700 p-2 rounded"
                  >
                    Color
                  </button>
                  <button
                    onClick={() => setShowBgMenu(false)}
                    className="block w-full text-left text-xs text-zinc-300 hover:bg-zinc-700 p-2 rounded"
                  >
                    Internet
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="ml-auto bg-green-600 text-white px-6 py-3 rounded-lg text-sm font-bold tracking-wider hover:bg-green-500 disabled:opacity-50"
            >
              {saving ? '...' : 'GUARDAR'}
            </button>
          </div>
        </div>
      </div>

      <BackButton onClick={handleBack} />
    </div>
  )
}