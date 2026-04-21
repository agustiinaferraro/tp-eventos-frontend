// =====================
// ExperienceEditScreen.jsx - Personalizar experiencia de sala
// =====================

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NavBar from './NavBar'
import BackButton from './BackButton'
import { apiGetExperience, apiSaveExperience } from '../utils/api'

const LEVELS = [
  { key: 'level0', label: '0-499 pts', desc: 'Nivel inicial' },
  { key: 'level1', label: '500-999 pts', desc: 'Nivel intermedio' },
  { key: 'level2', label: '1000 pts', desc: 'Nivel máximo' }
]

export default function ExperienceEditScreen() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('level0')
  const [sala, setSala] = useState(null)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-900">
      <NavBar currentProfile={null} onMenuAction={() => {}} />
      
      <div className="max-w-2xl mx-auto p-4 pt-20">
        <BackButton onClick={handleBack} />
        
        <h1 className="text-2xl text-green-400 tracking-wider mt-4 mb-6">
          PERSONALIZAR EXPERIENCIA
        </h1>
        <p className="text-zinc-400 mb-6">Sala: {sala?.name}</p>

        {/* TABS */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {LEVELS.map(level => (
            <button
              key={level.key}
              onClick={() => setActiveTab(level.key)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                activeTab === level.key 
                  ? 'bg-green-600 text-white' 
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {level.label}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('effects')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'effects' 
                ? 'bg-green-600 text-white' 
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            Efectos
          </button>
        </div>

        {/* NIVEL CONFIG */}
        {LEVELS.map(level => (
          <div key={level.key} className={activeTab === level.key ? '' : 'hidden'}>
            <h2 className="text-xl text-white mb-4">{level.desc}</h2>
            
            {/* Color */}
            <div className="mb-4">
              <label className="block text-zinc-400 mb-2">Color de barra</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={experience[level.key].color}
                  onChange={(e) => updateLevel(level.key, 'color', e.target.value)}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={experience[level.key].color}
                  onChange={(e) => updateLevel(level.key, 'color', e.target.value)}
                  className="flex-1 bg-zinc-800 text-white p-2 rounded"
                />
              </div>
            </div>

            {/* Mensaje */}
            <div className="mb-4">
              <label className="block text-zinc-400 mb-2">Mensaje motivacional</label>
              <input
                type="text"
                value={experience[level.key].message}
                onChange={(e) => updateLevel(level.key, 'message', e.target.value)}
                maxLength={30}
                className="w-full bg-zinc-800 text-white p-2 rounded"
              />
            </div>

            {/* Fondo color */}
            <div className="mb-4">
              <label className="block text-zinc-400 mb-2">Color de fondo</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={experience[level.key].background || '#000000'}
                  onChange={(e) => updateLevel(level.key, 'background', e.target.value)}
                  className="w-16 h-12 rounded cursor-pointer"
                />
                <button
                  onClick={() => updateLevel(level.key, 'background', null)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded"
                >
                  Sin color
                </button>
              </div>
            </div>

            {/* Imagen de fondo */}
            <div className="mb-4">
              <label className="block text-zinc-400 mb-2">Imagen de fondo (URL)</label>
              <input
                type="text"
                value={experience[level.key].backgroundImage || ''}
                onChange={(e) => updateLevel(level.key, 'backgroundImage', e.target.value)}
                placeholder="https://..."
                className="w-full bg-zinc-800 text-white p-2 rounded"
              />
              {experience[level.key].backgroundImage && (
                <img 
                  src={experience[level.key].backgroundImage} 
                  alt="Preview" 
                  className="mt-2 w-full h-32 object-cover rounded"
                />
              )}
            </div>

            {/* Partículas */}
            <div className="mb-4 flex items-center gap-4">
              <label className="text-zinc-400">Partículas activas</label>
              <button
                onClick={() => updateLevel(level.key, 'particles', !experience[level.key].particles)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  experience[level.key].particles ? 'bg-green-600' : 'bg-zinc-700'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  experience[level.key].particles ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        ))}

        {/* EFECTOS CONFIG */}
        <div className={activeTab === 'effects' ? '' : 'hidden'}>
          <h2 className="text-xl text-white mb-4">Configuración de efectos</h2>
          
          <div className="mb-4">
            <label className="block text-zinc-400 mb-2">Cantidad de partículas</label>
            <input
              type="range"
              min="10"
              max="100"
              value={experience.effects.particleCount}
              onChange={(e) => updateEffects('particleCount', parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-white">{experience.effects.particleCount}</span>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <label className="text-zinc-400">Mostrar gestos</label>
            <button
              onClick={() => updateEffects('showGestures', !experience.effects.showGestures)}
              className={`w-12 h-6 rounded-full transition-colors ${
                experience.effects.showGestures ? 'bg-green-600' : 'bg-zinc-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                experience.effects.showGestures ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="mb-4 flex items-center gap-4">
            <label className="text-zinc-400">Mostrar near threshold</label>
            <button
              onClick={() => updateEffects('showNearThreshold', !experience.effects.showNearThreshold)}
              className={`w-12 h-6 rounded-full transition-colors ${
                experience.effects.showNearThreshold ? 'bg-green-600' : 'bg-zinc-700'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                experience.effects.showNearThreshold ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="mt-6 p-4 rounded-lg" style={{
          backgroundColor: experience[activeTab]?.background || '#000',
          backgroundImage: experience[activeTab]?.backgroundImage ? `url(${experience[activeTab].backgroundImage})` : undefined,
          backgroundSize: 'cover'
        }}>
          <h3 className="text-zinc-400 mb-2">Preview</h3>
          <div className="text-center">
            <p className="text-3xl mb-4" style={{ color: experience[activeTab]?.color }}>
              {experience[activeTab]?.color}
            </p>
            <p className="text-xl text-white">
              {experience[activeTab]?.message}
            </p>
            {experience[activeTab]?.particles && (
              <div className="text-zinc-500 mt-2">
                ● ● ● partículas activas
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-green-600 text-white py-4 rounded-lg mt-6 tracking-wider hover:bg-green-500 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : 'GUARDAR CAMBIOS'}
        </button>
      </div>
    </div>
  )
}