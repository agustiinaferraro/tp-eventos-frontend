// =====================
// ProfilesScreen.jsx - Selector de Perfiles
// =====================

// Importamos React y los hooks necesarios
import React, { useState, useEffect } from 'react'

// useNavigate para navegar entre pantallas
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

import NavBar from './NavBar'

// API del backend
import { apiGet, apiPost } from '../utils/api'

// Componente principal de la pantalla de selección de perfiles
export default function ProfilesScreen() {
  // Obtenemos el usuario actual del contexto
  const { user } = useAuth()
  
  // Hook para navegar programáticamente
  const navigate = useNavigate()

  // =====================
  // ESTADOS
  // =====================
  // profiles: array con todos los perfiles del usuario
  const [profiles, setProfiles] = useState([])
  
  // manageMode: si está en true, podemos editar/eliminar perfiles
  // si está en false, tocar un perfil lo selecciona
  const [manageMode, setManageMode] = useState(false)

  // =====================
  // EFECTO: CARGAR PERFILES AL MONTAR
  // =====================
  // useEffect se ejecuta cuando el componente se monta y cuando 'user' cambia
  useEffect(() => {
    loadProfiles()  // Cargamos los perfiles del usuario
  }, [user])  // Dependencia en user para recargar si cambia de cuenta

  // =====================
  // FUNCIÓN: CARGAR PERFILES
  // =====================
  const loadProfiles = async () => {
    if (!user?.uid) return
    
    try {
      const data = await apiGet(`/api/users/${user.uid}/profiles`)
      if (data.profiles) {
        setProfiles(data.profiles)
        return
      }
    } catch (e) {}
    
    // Si falla el backend, intentamos localStorage
    const saved = localStorage.getItem('profiles_' + user.uid)
    if (saved) {
      const cached = JSON.parse(saved)
      setProfiles(cached.map(p => ({
        name: p.name,
        color: p.color,
        image: p.image === 'CACHED' ? null : p.image
      })))
    }
  }

  // =====================
  // FUNCIÓN: GUARDAR PERFILES
  // =====================
  const saveProfiles = async (newProfiles) => {
    setProfiles(newProfiles)
    
    try {
      await apiPost(`/api/users/${user.uid}/profiles`, { profiles: newProfiles })
    } catch (e) {}
    
    // Guardamos cache en localStorage sin las imágenes completas
    const profilesForCache = newProfiles.map(p => ({
      name: p.name,
      color: p.color,
      image: p.image ? 'CACHED' : null
    }))
    
    try {
      localStorage.setItem('profiles_' + user.uid, JSON.stringify(profilesForCache))
    } catch (e) {}
  }

  // =====================
  // FUNCIÓN: SELECCIONAR PERFIL
  // =====================
  const handleSelectProfile = (index) => {
    // Dependiendo del modo:
    if (manageMode) {
      // Modo gestión: navegamos a editar el perfil en ese índice
      navigate('/profiles/edit', { state: { index } })
    } else {
      // Modo normal: seleccionamos el perfil y vamos al dashboard
      localStorage.setItem('currentProfile', JSON.stringify(profiles[index]))
      navigate('/dashboard')
    }
  }

  // =====================
  // FUNCIÓN: ELIMINAR PERFIL
  // =====================
  const handleDeleteProfile = async (index) => {
    // Pedimos confirmación con window.confirm
    if (confirm('¿Eliminar este perfil?')) {
      // Creamos nuevo array sin el perfil en esa posición
      const newProfiles = [...profiles]  // Copiamos el array
      newProfiles.splice(index, 1)       // Eliminamos 1 elemento en esa posición
      await saveProfiles(newProfiles)    // Guardamos el array sin ese perfil
      setManageMode(false)               // Salimos del modo gestión
    }
  }

  // =====================
  // RENDERIZADO
  // =====================
return (
    <div className='flex flex-col items-center min-h-screen w-full p-10 pt-24'>
      
      {/* Título */}
      <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-16 text-center">
        ¿QUIÉN SOS?
      </h1>
      
      {/* Grid de perfiles (2 columnas en móvil, 3 en desktop) */}
      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mt-10 mx-auto">
        
        {/* Recorremos cada perfil y lo mostramos */}
        {profiles.map((profile, i) => (
          // key={i} es el índice, necesario para React
          <div
            key={i}
            className={`flex flex-col items-center cursor-pointer transition-all hover:scale-105 w-28 md:w-32 ${manageMode ? 'opacity-80' : ''}`}
            onClick={() => handleSelectProfile(i)}  // Al tocar, seleccionamos/editamos
          >
            {/* Avatar circular del perfil */}
            <div
              className={`w-24 h-24 md:w-32 md:h-32 rounded-full border-4 ${manageMode ? 'border-zinc-500' : 'border-zinc-600'} flex items-center justify-center text-4xl md:text-5xl transition-all hover:border-green-400 hover:scale-110 relative`}
              style={{ background: profile.color || '#222' }}
            >
              {/* Si tiene imagen, mostramos la imagen */}
              {profile.image ? (
                <img
                  src={profile.image}
                  className="w-full h-full object-cover rounded-full"
                  alt={profile.name}
                />
              ) : (
                <span className="text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.9)]">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              )}
              
              {/* Overlay negro translúcido + lápiz - siempre visible en manageMode */}
              {manageMode && (
                <>
                  <div className="absolute inset-0 bg-black/60 rounded-full z-10"></div>
                  <span className="absolute inset-0 flex items-center justify-center text-4xl text-white z-20">
                    &#9998;
                  </span>
                </>
              )}
            </div>
            
            {/* Nombre del perfil */}
            <p className="mt-4 text-base text-zinc-300 tracking-wider">{profile.name}</p>
          </div>
        ))}
        
        {/* Tarjeta para agregar nuevo perfil */}
        <div
          className="flex flex-col items-center cursor-pointer w-28 md:w-32"
          onClick={() => navigate('/profiles/edit', { state: { index: -1 } })}
          // index: -1 significa "nuevo perfil" (no estamos editando ninguno existente)
        >
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-dashed border-zinc-600 flex items-center justify-center text-4xl md:text-5xl text-zinc-600 transition-all hover:border-green-400 hover:text-green-400 hover:scale-110">
            +
          </div>
          <p className="mt-4 text-base text-zinc-600 tracking-wider">Agregar perfil</p>
        </div>
      </div>
      
      {/* Botón para alternar modo gestión */}
      <button
        className="bg-transparent border-none text-green-400 text-sm cursor-pointer mt-12 tracking-wider transition-all hover:text-green-300 hover:scale-105 active:scale-95"
        onClick={() => setManageMode(!manageMode)}
      >
        {manageMode ? 'Listo' : 'Gestionar perfiles'}
      </button>
    </div>
  )
}
