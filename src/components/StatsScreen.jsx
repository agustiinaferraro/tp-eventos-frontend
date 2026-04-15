// =====================
// StatsScreen.jsx - Estadísticas de Salas
// =====================

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiGet } from '../utils/api'

import NavBar from './NavBar'
import BackButton from './BackButton'

export default function StatsScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState(null)
  const [selectedSala, setSelectedSala] = useState(location.state?.salaName || '')
  const [salaData, setSalaData] = useState(location.state?.salaData || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedSala) return;
    handleViewStats();
    
    const interval = setInterval(handleViewStats, 5000);
    return () => clearInterval(interval);
  }, [selectedSala]);

  const handleViewStats = async () => {
    if (!selectedSala.trim()) return
    setLoading(true)
    setError('')
    try {
      const data = await apiGet(`/api/stats/${selectedSala}`)
      setStats(data)
    } catch (e) {
      setError('No se pudieron cargar las estadísticas. Intentá más tarde.')
    }
    setLoading(false)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-AR')
  }

return (
    <div className='flex flex-col items-center min-h-screen w-full p-10 relative'>
      {/* Fondo con brillo */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: salaData?.image ? `url(${salaData.image}) center/cover no-repeat` : salaData?.color || '#000',
          filter: salaData?.brightness ? `brightness(${salaData.brightness}%)` : undefined
        }}
      />
      
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/70 z-0"></div>
      
      <NavBar />
      <BackButton onClick={() => navigate(-1)} />
      
      {/* Título y contenido */}
      <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-4 text-center relative z-10">
        ESTADÍSTICAS
      </h1>
      
      {selectedSala && (
        <p className="text-3xl text-white tracking-widest mt-8 mb-12 text-center uppercase relative z-10">
          {selectedSala}
        </p>
      )}
      
      {error && (
        <p className="text-xl text-red-400 text-center mb-8 relative z-10">{error}</p>
      )}

      {stats && (
        <div className="w-full max-w-2xl relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center">
              <p className="text-3xl text-green-400 font-bold">{stats.summary?.connections || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">Entradas</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center">
              <p className="text-3xl text-red-400 font-bold">{stats.summary?.disconnections || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">Salidas</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center">
              <p className="text-3xl text-blue-400 font-bold">{stats.summary?.activeConnections || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">Jugadores ahora</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center">
              <p className="text-3xl text-yellow-400 font-bold">{stats.summary?.totalEnergy || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">Energía total</p>
            </div>
          </div>

          <h2 className="text-lg text-zinc-300 mb-4">Actividad reciente</h2>
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-h-96 overflow-y-auto">
            {stats.stats && stats.stats.length > 0 ? (
              stats.stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border-b border-zinc-800 last:border-b-0">
                  <span className={`w-3 h-3 rounded-full ${
                    stat.type === 'connect' ? 'bg-green-500' : 
                    stat.type === 'disconnect' ? 'bg-red-500' : 
                    'bg-yellow-500'
                  }`}></span>
                  <span className="text-sm text-zinc-400 flex-1">
                    {stat.type === 'connect' && 'Usuario entró'}
                    {stat.type === 'disconnect' && 'Usuario salió'}
                    {stat.type === 'energy' && `Energía: +${stat.energy}`}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {formatDate(stat.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-zinc-500 p-4">No hay actividad registrada</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
