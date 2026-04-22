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
  const [bgInput, setBgInput] = useState('')
  const [bgInputVisible, setBgInputVisible] = useState(false)
  const skipPreviewRef = useRef(false)
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
    if (skipPreviewRef.current) {
      skipPreviewRef.current = false
      return
    }
    if (iframeRef.current) {
      const currentLevelKey = getLevelForPoints(previewPoints)
      const config = {
        points: previewPoints,
        room: sala?.name || 'test',
        experience: experience,
        currentLevel: currentLevelKey
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

  const progress = previewPoints / 1000

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    )
  }

  function handleColorChange(color) {
    const newExp = {
      level0: { ...experience.level0, color },
      level1: { ...experience.level1, color },
      level2: { ...experience.level2, color }
    }
    setExperience(newExp)
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {bgInputVisible ? (
        <div className="p-2 bg-zinc-950 flex justify-between items-center">
          <BackButton onClick={() => setBgInputVisible(false)} />
          <input
            type="text"
            value={bgInput}
            onChange={(e) => setBgInput(e.target.value)}
            placeholder="URL de imagen..."
            className="flex-1 mx-2 bg-zinc-800 text-white text-sm p-1 rounded max-w-40"
            onKeyDown={(e) => e.key === 'Enter' && updateLevel(currentLevel, 'backgroundImage', bgInput)}
          />
          <button
            onClick={() => { updateLevel(currentLevel, 'backgroundImage', bgInput); setBgInputVisible(false) }}
            className="text-green-500 text-sm"
          >
            ✓
          </button>
        </div>
      ) : (
        <div className="fixed top-2 right-2 z-50 flex gap-2">
          <button
            onClick={handleBack}
            className="bg-zinc-800 text-white p-2 rounded-full text-xs"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 relative">
        <iframe
          ref={iframeRef}
          src={experienceUrl}
          className="w-full h-full border-0"
          title="Preview experiencia"
          allow="accelerometer"
        />
      </div>

      <div className="flex-shrink-0 bg-zinc-900 border-t border-zinc-800 p-3">
        <div className="mb-3">
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
            <span className="text-xs font-bold" style={{ color: currentLvl.color }}>
              {previewPoints} pts — {LEVELS.find(l => l.key === currentLevel)?.label}
            </span>
            <span className="text-xs text-zinc-500">1000</span>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap items-end justify-center">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Color</label>
            <input
              type="color"
              value={currentLvl.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-14 h-14 rounded-lg cursor-pointer border-2 border-zinc-700"
            />
          </div>

          <div className="relative">
            <label className="text-xs text-zinc-500 block mb-1">Fondo</label>
            <button
              onClick={() => setShowBgMenu(!showBgMenu)}
              className="w-14 h-14 rounded-lg border-2 border-zinc-700 bg-zinc-800 flex items-center justify-center text-3xl"
            >
              🖼️
            </button>
            {showBgMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-zinc-800 rounded-lg p-2 shadow-lg z-20 w-44">
                <button
                  onClick={() => { setShowIaInput(true); setShowBgMenu(false) }}
                  className="block w-full text-left text-sm text-zinc-300 hover:bg-zinc-700 p-2 rounded"
                >
                  IA (proximamente)
                </button>
                <button
                  onClick={() => { setBgInputVisible(true); setShowBgMenu(false) }}
                  className="block w-full text-left text-sm text-zinc-300 hover:bg-zinc-700 p-2 rounded"
                >
                  Internet
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-4 rounded-lg text-sm font-bold tracking-wider hover:bg-green-500 disabled:opacity-50"
          >
            {saving ? '...' : 'GUARDAR'}
          </button>
        </div>
      </div>
    </div>
  )
}