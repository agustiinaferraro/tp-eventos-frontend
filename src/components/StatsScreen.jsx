// =====================
// StatsScreen.jsx - Estadísticas de Salas
// =====================

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiGet } from '../utils/api'

import BackButton from './BackButton'

import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'

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
      // Normalizar nombre: minúsculas y espacios por guiones
      const normalizedSala = selectedSala.toLowerCase().replace(/\s+/g, '-')
      const data = await apiGet(`/api/stats/${normalizedSala}`)
      setStats(data)
    } catch (e) {
      setError('No se pudieron cargar las estadísticas. Intentá más tarde.')
    }
    setLoading(false)
  }

  // Preparar datos para gráficos
  const energyData = stats?.stats
    ?.filter(s => s.type === 'energy')
    ?.slice(-20)
    ?.map(s => ({
      time: new Date(s.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      energy: s.energy || 0,
      total: s.totalPoints || 0
    })) || []

  const typeData = stats?.stats
    ?.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1
      return acc
    }, {})
  
  const pieData = typeData ? Object.keys(typeData).map(key => ({
    name: key === 'connect' ? 'Entradas' : key === 'disconnect' ? 'Salidas' : 'Energía',
    value: typeData[key]
  })) : []

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
      
      <div className="pointer-events-none w-full max-w-5xl">
        <BackButton onClick={() => {
          const savedSala = localStorage.getItem('currentSala')
          if (savedSala) {
            navigate('/sala')
          } else {
            navigate('/dashboard')
          }
        }} />
      </div>
      
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

            {/* Gráfico lineal: Evolución de energía y puntos */}
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-8">
              <p className="text-lg text-zinc-300 mb-4">Evolución de energía y puntos</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={energyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="time" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} />
                  <Legend />
                  <Line type="monotone" dataKey="energy" stroke="#ff6b00" name="Energía" />
                  <Line type="monotone" dataKey="total" stroke="#00ff88" name="Puntos totales" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráficos de barras y circular */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Gráfico de barras: Distribución de actividad */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <p className="text-lg text-zinc-300 mb-4">Distribución de actividad</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={pieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} />
                    <Bar dataKey="value" fill="#8884d8" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gráfico circular: Proporción de actividad */}
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <p className="text-lg text-zinc-300 mb-4">Proporción de actividad</p>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#00ff88', '#ff6b00', '#ffdd00'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
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
