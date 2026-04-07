// =====================
// StatsScreen.jsx - Estadísticas de Salas
// =====================

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiGet } from '../utils/api'

export default function StatsScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const [stats, setStats] = useState(null)
  const [selectedSala, setSelectedSala] = useState(location.state?.salaName || '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedSala) return;
    handleViewStats();
    
    const interval = setInterval(handleViewStats, 5000);
    return () => clearInterval(interval);
  }, [selectedSala]);

  const handleViewStats = async () => {
    if (!selectedSala.trim()) return
    setLoading(true)
    try {
      const data = await apiGet(`/api/stats/${selectedSala}`)
      setStats(data)
    } catch (e) {
      alert('Error al cargar estadísticas')
    }
    setLoading(false)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-AR')
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full p-10">
      
      <button
        className="absolute top-8 left-8 text-5xl text-white bg-transparent border-none cursor-pointer hover:opacity-70"
        onClick={() => navigate('/dashboard')}
      >
        ‹
      </button>
      
      <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-12 text-center">
        ESTADÍSTICAS
      </h1>

      <div className="w-full max-w-md mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            className="flex-1 bg-zinc-900 border-2 border-zinc-700 text-white text-center p-4 rounded-lg outline-none focus:border-green-400 placeholder-zinc-500"
            placeholder="Nombre de la sala"
            value={selectedSala}
            onChange={(e) => setSelectedSala(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleViewStats()}
          />
          <button
            className="bg-green-600 text-white px-6 py-4 rounded-lg cursor-pointer hover:bg-green-500 disabled:opacity-50"
            onClick={handleViewStats}
            disabled={loading || !selectedSala.trim()}
          >
            {loading ? '...' : 'Ver'}
          </button>
        </div>
      </div>

      {stats && (
        <div className="w-full max-w-2xl">
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
