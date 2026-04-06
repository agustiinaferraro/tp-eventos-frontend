// =====================
// DashboardScreen.jsx - Panel de Gestión de Salas
// =====================

// Importamos React y los hooks necesarios
import React, { useState, useEffect } from 'react'

// useNavigate para navegar entre pantallas
import { useNavigate } from 'react-router-dom'

// useAuth: usuario actual
// auth: instancia de Firebase Auth
// db: instancia de Firestore
import { useAuth, auth, db } from '../context/AuthContext'

// Funciones de Firestore para guardar/cargar datos
import { doc, getDoc, setDoc } from 'firebase/firestore'

// signOut para cerrar sesión
import { signOut } from 'firebase/auth'

// Componente principal del dashboard
export default function DashboardScreen() {
  // Usuario actual
  const { user } = useAuth()
  
  // Navegación
  const navigate = useNavigate()

  // =====================
  // ESTADOS
  // =====================
  // currentProfile: el perfil seleccionado actualmente
  const [currentProfile, setCurrentProfile] = useState(null)
  
  // salas: array con las salas de este perfil
  const [salas, setSalas] = useState([])
  
  // showDropdown: si el menú dropdown del usuario está visible
  const [showDropdown, setShowDropdown] = useState(false)
  
  // showSwitchModal: si el modal de cambiar cuenta está visible
  const [showSwitchModal, setShowSwitchModal] = useState(false)
  
  // savedAccounts: cuentas guardadas en localStorage para quick switch
  const [savedAccounts, setSavedAccounts] = useState([])

  // =====================
  // EFECTO: CARGAR DATOS AL MONTAR
  // =====================
  useEffect(() => {
    // Cargamos el perfil actual de localStorage
    const saved = localStorage.getItem('currentProfile')
    if (saved) setCurrentProfile(JSON.parse(saved))
    
    // Cargamos las salas de este perfil
    loadSalas()
    
    // Cargamos las cuentas guardadas
    loadSavedAccounts()
  }, [])  // Solo se ejecuta al montar

  // =====================
  // FUNCIÓN: CARGAR SALAS
  // =====================
  const loadSalas = async () => {
    // Obtenemos el perfil actual
    const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
    
    // La key en localStorage incluye: userId + nombre del perfil
    // Así cada perfil tiene sus propias salas
    const saved = localStorage.getItem('salas_' + user.uid + '_' + profile.name)
    let localSalas = saved ? JSON.parse(saved) : []
    
    try {
      // Intentamos cargar desde Firestore
      // La ruta es: /users/{userId}/profiles/{profileName}
      const docSnap = await getDoc(doc(db, 'users', user.uid, 'profiles', profile.name))
      
      if (docSnap.exists() && docSnap.data().salas) {
        localSalas = docSnap.data().salas
      }
    } catch (e) {
      // Si falla, usamos los datos locales
    }
    
    setSalas(localSalas)
  }

  // =====================
  // FUNCIÓN: GUARDAR SALAS
  // =====================
  const saveSalas = async (newSalas) => {
    const profile = JSON.parse(localStorage.getItem('currentProfile') || '{}')
    
    // Actualizamos estado
    setSalas(newSalas)
    
    // Guardamos en localStorage
    localStorage.setItem('salas_' + user.uid + '_' + profile.name, JSON.stringify(newSalas))
    
    // Guardamos en Firestore
    await setDoc(doc(db, 'users', user.uid, 'profiles', profile.name), { salas: newSalas }, { merge: true })
  }

  // =====================
  // FUNCIÓN: CARGAR CUENTAS GUARDADAS
  // =====================
  const loadSavedAccounts = () => {
    // Carga las cuentas que el usuario guardó al hacer login
    // Esto permite cambiar rápidamente entre cuentas sin escribir email/pass
    setSavedAccounts(JSON.parse(localStorage.getItem('savedAccounts') || '[]'))
  }

  // =====================
  // FUNCIÓN: CERRAR SESIÓN
  // =====================
  const handleLogout = async () => {
    await signOut(auth)  // Cerramos sesión en Firebase
    navigate('/')        // Navegamos al login
  }

  // =====================
  // FUNCIÓN: CAMBIAR CUENTA
  // =====================
  const handleSwitchAccount = async (email) => {
    await signOut(auth)                           // Cerramos sesión actual
    localStorage.setItem('lastEmail', email)    // Guardamos el email seleccionado
    window.location.reload()                      // Recargamos para mostrar login
  }

  // =====================
  // FUNCIÓN: CREAR NUEVA SALA
  // =====================
  const handleCreateSala = () => {
    // prompt() muestra un diálogo para que el usuario ingrese texto
    const name = prompt('Nombre del artista o banda:')
    
    if (name) {
      // Creamos la sala con nombre y un ID único (timestamp)
      const newSalas = [...salas, { name, id: Date.now() }]
      saveSalas(newSalas)
    }
  }

  // =====================
  // FUNCIÓN: ELIMINAR SALA
  // =====================
  const handleDeleteSala = async (index) => {
    if (confirm('¿Eliminar esta sala?')) {
      const newSalas = [...salas]
      newSalas.splice(index, 1)  // Eliminamos 1 elemento en esa posición
      await saveSalas(newSalas)
    }
  }

  // =====================
  // FUNCIÓN: ABRIR SALA
  // =====================
  const openSala = (sala) => {
    // Guardamos la sala seleccionada en localStorage
    localStorage.setItem('currentSala', JSON.stringify(sala))
    // Navegamos a la pantalla de la sala
    navigate('/sala')
  }

  // =====================
  // RENDERIZADO
  // =====================
  return (
    <div className="flex flex-col items-center min-h-screen w-full p-10">
      
      {/* ===================== */}
      {/* HEADER CON USUARIO Y MENÚ */}
      {/* ===================== */}
      <div className="w-full max-w-5xl flex justify-start mb-8 relative">
        
        {/* Menú del usuario (click para abrir dropdown) */}
        <div
          className="flex items-center gap-4 cursor-pointer relative"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          {/* Avatar del usuario */}
          <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-green-400 overflow-hidden">
            {currentProfile?.image ? (
              // Si tiene imagen, la mostramos
              <img
                src={currentProfile.image}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              // Si no, mostramos la inicial
              currentProfile?.name?.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* Nombre del usuario */}
          <span className="text-base text-zinc-300 tracking-widest">
            {currentProfile?.name?.toUpperCase()}
          </span>
          
          {/* Flecha indicadora del dropdown */}
          <span className="text-zinc-500 text-xl">▼</span>
          
          {/* Menú dropdown (solo visible si showDropdown es true) */}
          {showDropdown && (
            <div className="absolute top-full left-0 mt-4 bg-zinc-800 border border-zinc-700 rounded-lg py-2 min-w-48 z-50 shadow-xl">
              
              {/* Opción: Cambiar cuenta */}
              <div
                className="px-5 py-3 text-white cursor-pointer hover:bg-zinc-700 tracking-wider text-center border border-zinc-700 rounded-md mx-2 mb-2"
                onClick={() => {
                  setShowDropdown(false)
                  setShowSwitchModal(true)
                }}
              >
                Cambiar cuenta
              </div>
              
              {/* Opción: Cerrar sesión */}
              <div
                className="px-5 py-3 text-white cursor-pointer hover:bg-zinc-700 tracking-wider text-center"
                onClick={handleLogout}
              >
                Cerrar sesión
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* ===================== */}
      {/* TÍTULO Y LISTA DE SALAS */}
      {/* ===================== */}
      <h1 className="text-4xl md:text-6xl tracking-widest text-green-400 mb-16 text-center w-full max-w-5xl">
        MIS SALAS
      </h1>
      
      <p className="text-xl text-white tracking-widest mb-10 w-full max-w-5xl px-2 uppercase">
        Salas activas
      </p>
      
      {/* Grid de salas (1 columna en móvil, 3 en desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        
        {/* Recorremos las salas y las mostramos */}
        {salas.map((sala, i) => (
          <div
            key={sala.id || i}
            className="bg-zinc-900 border border-zinc-700 rounded-lg p-10 cursor-pointer transition-all hover:border-green-400 hover:scale-[1.02] relative"
            onClick={() => openSala(sala)}
          >
            {/* Botón eliminar (X) en la esquina */}
            <button
              className="absolute top-4 right-4 bg-transparent border-none text-zinc-500 text-2xl cursor-pointer transition-all hover:text-red-500 hover:scale-125"
              onClick={(e) => {
                e.stopPropagation()  // Evita que se abra la sala al tocar X
                handleDeleteSala(i)
              }}
            >
              ×
            </button>
            
            {/* Nombre de la sala */}
            <p className="text-xl text-white mb-2">{sala.name.toUpperCase()}</p>
            
            {/* Estado */}
            <p className="text-base text-zinc-400">Sala activa</p>
          </div>
        ))}
        
        {/* Tarjeta para crear nueva sala */}
        <div
          className="bg-transparent border-2 border-dashed border-zinc-600 rounded-lg p-5 cursor-pointer transition-all hover:border-green-400 hover:text-green-400 hover:scale-105 flex flex-col items-center justify-center text-zinc-500"
          onClick={handleCreateSala}
        >
          <span className="text-3xl">+</span>
          <span className="text-sm mt-2">Nueva sala</span>
        </div>
      </div>

      {/* ===================== */}
      {/* MODAL: CAMBIAR CUENTA */}
      {/* ===================== */}
      {showSwitchModal && (
        // Overlay oscuro que cubre toda la pantalla
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-5"
          onClick={() => setShowSwitchModal(false)}  // Click fuera cierra el modal
        >
          {/* Botón cerrar */}
          <button
            className="absolute top-5 right-5 bg-transparent border-none text-zinc-500 text-2xl cursor-pointer hover:text-white"
            onClick={() => setShowSwitchModal(false)}
          >
            ×
          </button>
          
          <p className="text-3xl text-green-400 tracking-widest mb-10">
            CAMBIAR CUENTA
          </p>
          
          {/* Lista de cuentas guardadas */}
          <div className="w-full max-w-md mb-8">
            {savedAccounts.map((email, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 bg-zinc-800 border border-zinc-700 rounded-lg cursor-pointer transition-all hover:border-green-400 hover:scale-[1.02] mb-3"
                onClick={() => handleSwitchAccount(email)}
              >
                {/* Avatar (inicial del email) */}
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-green-400">
                  {email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-white">{email}</p>
                  <p className="text-xs text-zinc-500">Tocá para cambiar</p>
                </div>
              </div>
            ))}
            
            {savedAccounts.length === 0 && (
              <p className="text-white text-center mb-8">No hay cuentas guardadas</p>
            )}
          </div>
          
          {/* Botón: Cerrar todas las sesiones */}
          <button
            className="w-full max-w-md bg-transparent border-2 border-white text-white py-4 px-6 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-red-700 hover:border-red-700"
            onClick={async () => {
              await signOut(auth)
              localStorage.removeItem('savedAccounts')
              navigate('/')
            }}
          >
            Cerrar todas las sesiones
          </button>
        </div>
      )}
    </div>
  )
}
