// =====================
// ExperienceEditScreen.jsx - Personalizar experiencia de sala
// =====================

 import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiGetExperience, apiSaveExperience, generateImageWithAI } from '../utils/api'
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
  const [bgInput, setBgInput] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState('')
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

   function sendPreview() {
    if (iframeRef.current) {
      const currentLevelKey = getLevelForPoints(previewPoints)
      const config = {
        points: previewPoints,
        room: sala?.name || 'test',
        experience: experience,
        currentLevel: currentLevelKey
      }
      console.log('sendPreview - level0:', experience.level0?.color)
      console.log('sendPreview - level1:', experience.level1?.color)
      console.log('sendPreview - level2:', experience.level2?.color)
      try {
        iframeRef.current.contentWindow?.postMessage(
          { type: 'EXPERIENCE_PREVIEW', config },
          '*'
        )
      } catch (e) {
        console.error('Error sending preview:', e)
      }
    }
  }

  useEffect(() => {
    if (skipPreviewRef.current) {
      skipPreviewRef.current = false
      return
    }
    sendPreview()
  }, [previewPoints, experience, sala])

  useEffect(() => {
    if (!loading && iframeRef.current) {
      const timer1 = setTimeout(sendPreview, 500)
      const timer2 = setTimeout(sendPreview, 1500)
      const timer3 = setTimeout(sendPreview, 3000)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [loading, experience])

   function normalizeSalaName(name) {
    return name.toLowerCase().replace(/\s+/g, '-')
  }

    async function loadExperience(salaName) {
    try {
      const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
      console.log('loadExperience - profile:', profile)
      console.log('loadExperience - salaName original:', salaName)
      
      const normalizedName = normalizeSalaName(salaName)
      console.log('loadExperience - normalizedName:', normalizedName)
      console.log('loadExperience - profile.name:', profile.name)
      
      const data = await apiGetExperience(normalizedName, profile.name)
      console.log('loadExperience - data received:', data)
      
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
      const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
      console.log('handleSave - profile:', profile)
      console.log('handleSave - sala.name:', sala.name)
      
      const normalizedName = normalizeSalaName(sala.name)
      console.log('handleSave - normalizedName:', normalizedName)
      console.log('handleSave - profile.name:', profile.name)
      
      await apiSaveExperience(normalizedName, experience, profile.name)
      console.log('handleSave - guardado exitosamente')
      
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

    return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      <div className="fixed top-2 right-2 z-50 flex gap-2">
        <button
          onClick={handleBack}
          className="bg-zinc-800 text-white p-2 rounded-full text-xs"
        >
          ✕
        </button>
      </div>

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
          {LEVELS.map((level) => (
            <div key={level.key}>
              <label className="text-xs text-zinc-500 block mb-1">{level.label} ({level.min}-{level.max})</label>
              <input
                type="color"
                value={experience[level.key]?.color || '#ff6b00'}
                onChange={(e) => {
                  const newExp = {
                    ...experience,
                    [level.key]: { ...experience[level.key], color: e.target.value }
                  }
                  setExperience(newExp)
                }}
                className="w-14 h-14 rounded-lg cursor-pointer border-2 border-zinc-700"
              />
            </div>
          ))}

            <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Fondo (URL)</label>
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={bgInput}
                onChange={(e) => setBgInput(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="bg-zinc-800 text-white text-sm p-2 rounded border border-zinc-700 w-48 focus:border-green-500 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && bgInput.trim()) {
                    updateLevel(currentLevel, 'backgroundImage', bgInput.trim())
                  }
                }}
              />
              <button
                onClick={() => {
                  if (bgInput.trim()) {
                    updateLevel(currentLevel, 'backgroundImage', bgInput.trim())
                  }
                }}
                className="bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-500 disabled:opacity-50"
                disabled={!bgInput.trim()}
              >
                Aplicar
               </button>
            </div>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <label className="text-xs text-zinc-500">Generar con IA</label>
            {aiError && (
              <p className="text-xs text-red-400">{aiError}</p>
            )}
            <div className="flex gap-2 items-end">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => {
                  setAiPrompt(e.target.value)
                  setAiError('')
                }}
                placeholder="Ej: jazz night, neon lights, purple..."
                className="bg-zinc-800 text-white text-sm p-2 rounded border border-zinc-700 w-48 focus:border-green-500 focus:outline-none"
                disabled={isGenerating}
              />
              <button
                onClick={async () => {
                  if (!aiPrompt.trim() || isGenerating) return
                  
                  setIsGenerating(true)
                  setAiError('')
                  
                  try {
                    const imageUrl = await generateImageWithAI(aiPrompt.trim())
                    updateLevel(currentLevel, 'backgroundImage', imageUrl)
                    setAiPrompt('')
                  } catch (err) {
                    setAiError('Error: ' + err.message)
                  } finally {
                    setIsGenerating(false)
                  }
                }}
                disabled={isGenerating || !aiPrompt.trim()}
                className="bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-500 disabled:opacity-50"
              >
                {isGenerating ? '...' : '🤖 Generar'}
              </button>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white px-6 py-4 rounded-lg text-sm font-bold tracking-wider hover:bg-green-500 disabled:opacity-50 mt-2"
          >
            {saving ? '...' : 'GUARDAR'}
          </button>
        </div>
      </div>
    </div>
  )
}