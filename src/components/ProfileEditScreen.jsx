// =====================
// ProfileEditScreen.jsx - Crear o Editar Perfil
// =====================

// Importamos React y los hooks necesarios
// useRef: para crear referencias a elementos del DOM (como el input de archivo)
import React, { useState, useEffect, useRef } from 'react'

// useNavigate: para navegar entre pantallas
// useLocation: para obtener datos de la navegación (el índice del perfil a editar)
import { useNavigate, useLocation } from 'react-router-dom'

// useAuth: para obtener el usuario actual
import { useAuth } from '../context/AuthContext'

// API del backend
import { apiGet, apiPost } from '../utils/api'

// COLORS: array de colores predefinidos desde constants
import { COLORS } from '../constants'

import NavBar from './NavBar'
import BackButton from './BackButton'

// Componente principal
export default function ProfileEditScreen() {
  // Obtenemos el usuario actual
  const { user, setCurrentProfile } = useAuth()
  
  // Hooks para navegación
  const navigate = useNavigate()
  const location = useLocation()
  
  // Obtenemos el índice del perfil a editar desde la navegación
  // location.state es el objeto que pasamos en navigate()
  // ?? -1 significa: si no existe, usa -1 (nuevo perfil)
  const editingIndex = location.state?.index ?? -1
  
  // Si editingIndex es -1, estamos creando un perfil nuevo
  // Si editingIndex >= 0, estamos editando un perfil existente
  const isNew = editingIndex === -1

  // =====================
  // ESTADOS
  // =====================
  const [name, setName] = useState('')           // Nombre del perfil
  const [color, setColor] = useState(COLORS[0])  // Color seleccionado (primer color por defecto)
  const [image, setImage] = useState(null)       // Imagen del perfil (base64)
  const [choseColor, setChoseColor] = useState(false)  // Si el usuario eligió un color
  const [profiles, setProfiles] = useState([])    // Lista de todos los perfiles
  const [isSaving, setIsSaving] = useState(false) // Para evitar múltiples guards
  const [error, setError] = useState('')           // Mensaje de error
  
  // useRef para manipular el input de archivo directamente
  const fileInputRef = useRef(null)

  // =====================
  // EFECTO: CARGAR PERFIL EXISTENTE
  // =====================
  useEffect(() => {
    if (!user?.uid) return
    loadCurrentProfile()
  }, [user])

  // =====================
  // EFECTO: CUANDO CARGA PERFILES, PRECARGAR DATOS
  // =====================
  useEffect(() => {
    if (isNew || profiles.length === 0) return
    if (!profiles[editingIndex]) return
    
    const p = profiles[editingIndex]
    setName(p.name || '')
    if (p.image) {
      setImage(p.image)
      setChoseColor(false)
    } else {
      setColor(p.color || COLORS[0])
      setChoseColor(true)
    }
  }, [profiles, editingIndex, isNew])

  // =====================
  // FUNCIÓN: CARGAR PERFIL A EDITAR
  // =====================
  const loadCurrentProfile = async () => {
    if (!user?.uid) return
    
    try {
      const data = await apiGet(`/api/users/${user.uid}/profiles`)
      if (data.profiles) {
        setProfiles(data.profiles)
        return
      }
    } catch (e) {}
    
    // Si falla el backend, intentamos localStorage (sin imágenes)
    const saved = localStorage.getItem('profiles_' + user.uid)
    if (saved) {
      const cached = JSON.parse(saved)
      setProfiles(cached.map(p => ({
        name: p.name,
        color: p.color,
        image: null
      })))
    }
  }

  // =====================
  // FUNCIÓN: GUARDAR PERFILES
  // =====================
  const saveProfiles = async (newProfiles) => {
    // Solo guardamos en localStorage sin la imagen (para mostrar previews rápidamente)
    // Las imágenes completas van al backend
    const profilesForCache = newProfiles.map(p => ({
      name: p.name,
      color: p.color,
      image: p.image ? 'CACHED' : null
    }))
    
    try {
      localStorage.setItem('profiles_' + user.uid, JSON.stringify(profilesForCache))
    } catch (e) {}
    
    try {
      await apiPost(`/api/users/${user.uid}/profiles`, { profiles: newProfiles })
    } catch (err) {}
  }

  // =====================
  // FUNCIÓN: GUARDAR PERFIL
  // =====================
  const handleSave = async () => {
    if (isSaving) return
    if (!user?.uid) {
      setError('No hay usuario logueado')
      return
    }
    
    setIsSaving(true)
    
    const profileData = {
      name: name.trim(),
      color: choseColor ? color : (image ? null : (isNew ? color : profiles[editingIndex]?.color)),
      image: image
    }
    
    let newProfiles = [...profiles]
    
    if (isNew) {
      newProfiles.push(profileData)
    } else {
      newProfiles[editingIndex] = profileData
    }
    
    try {
      await saveProfiles(newProfiles)
      
      // Actualizar currentProfile si es el perfil actual
      const currentFromStorage = JSON.parse(localStorage.getItem('currentProfile') || '{}')
      const currentSala = JSON.parse(localStorage.getItem('currentSala') || 'null')
      
      if (currentFromStorage.name === name.trim()) {
        const updatedCurrent = { 
          ...currentFromStorage, 
          color: choseColor ? color : (image ? null : (isNew ? color : profiles[editingIndex]?.color)),
          image 
        }
        localStorage.setItem('currentProfile', JSON.stringify(updatedCurrent))
        setCurrentProfile(updatedCurrent)
        
        // Si estábamos en una sala, volver a la sala
        if (currentSala?.name) {
          navigate('/sala')
        } else {
          navigate('/dashboard')
        }
      } else {
        navigate('/profiles')
      }
    } catch (err) {
      setError('Error al guardar perfil. Intentá más tarde.')
    } finally {
      setIsSaving(false)
    }
  }

  // =====================
  // FUNCIÓN: ELIMINAR PERFIL
  // =====================
  const handleDelete = async () => {
    if (isSaving) return
    if (confirm('¿Eliminar este perfil?')) {
      setIsSaving(true)
      let newProfiles = [...profiles]
      newProfiles.splice(editingIndex, 1)
      try {
        await saveProfiles(newProfiles)
        navigate('/profiles')
      } finally {
        setIsSaving(false)
      }
    }
  }

  // =====================
  // FUNCIÓN: SELECCIONAR IMAGEN DE GALERÍA
  // =====================
  const handleImageSelect = (e) => {
    const file = e.target.files[0]  // Obtenemos el primer archivo seleccionado
    
    if (!file) return  // Si no hay archivo, salimos
    
    // FileReader permite leer archivos del sistema
    const reader = new FileReader()
    
    // Cuando termine de leer, guardamos el resultado (base64)
    reader.onload = (ev) => {
      const newImage = ev.target.result
      setImage(newImage)
      setChoseColor(false)
      
      // También actualizamos el perfil en el array de profiles para edición
      if (!isNew && profiles[editingIndex]) {
        const updatedProfiles = [...profiles]
        updatedProfiles[editingIndex] = {
          ...updatedProfiles[editingIndex],
          image: newImage,
          color: null
        }
        setProfiles(updatedProfiles)
      }
    }
    
    // Iniciamos la lectura del archivo como Data URL (base64)
    reader.readAsDataURL(file)
  }

  // =====================
  // FUNCIÓN: SELECCIONAR COLOR
  // =====================
  const handleColorSelect = (c) => {
    setChoseColor(true)
    setColor(c)
    setImage(null)
    
    // También actualizamos el perfil en el array de profiles para edición
    if (!isNew && profiles[editingIndex]) {
      const updatedProfiles = [...profiles]
      updatedProfiles[editingIndex] = {
        ...updatedProfiles[editingIndex],
        color: c,
        image: null
      }
      setProfiles(updatedProfiles)
    }
  }

  // =====================
  // FUNCIÓN: TOMAR FOTO CON CÁMARA
  // =====================
  const handleCamera = async () => {
    try {
      // Pedimos acceso a la cámara del dispositivo
      // facingMode: 'user' = cámara frontal
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false
      })
      
      // Creamos un elemento de video dinámicamente
      const video = document.createElement('video')
      video.srcObject = stream
      video.className = 'fixed top-0 left-0 w-full h-full z-[9999] bg-black object-cover'
      video.play()
      document.body.appendChild(video)
      
      // Botón para capturar la foto
      const captureBtn = document.createElement('button')
      captureBtn.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-20 h-20 rounded-full bg-white border-none cursor-pointer text-4xl'
      captureBtn.textContent = '📷'
      document.body.appendChild(captureBtn)
      
      // Botón para cerrar la cámara
      const closeBtn = document.createElement('button')
      closeBtn.className = 'fixed top-5 right-5 z-[10001] w-12 h-12 rounded-full bg-white/20 text-white text-xl border-none cursor-pointer'
      closeBtn.textContent = '✕'
      document.body.appendChild(closeBtn)
      
      let currentPhoto = null
      
      // Función de limpieza completa
      const cleanup = () => {
        stream.getTracks().forEach(t => t.stop())
        document.body.removeChild(video)
        document.body.removeChild(captureBtn)
        document.body.removeChild(closeBtn)
        if (currentPhoto) {
          document.body.removeChild(currentPhoto.canvas)
          document.body.removeChild(currentPhoto.confirmBtn)
          document.body.removeChild(currentPhoto.cancelBtn)
        }
      }
      
      closeBtn.onclick = cleanup
      
      // Al capturar, tomamos la foto y mostramos previsualización
      captureBtn.onclick = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d').drawImage(video, 0, 0)
        
        currentPhoto = {
          canvas: canvas,
          dataUrl: canvas.toDataURL('image/jpeg')
        }
        
        // Ocultamos video y capture button
        video.style.display = 'none'
        captureBtn.style.display = 'none'
        
        // Mostramos la foto capturada
        canvas.className = 'fixed top-0 left-0 w-full h-full z-[9999] bg-black object-cover'
        document.body.appendChild(canvas)
        
        // Botón confirmar (tilde)
        const confirmBtn = document.createElement('button')
        confirmBtn.className = 'fixed bottom-10 right-10 z-[10001] w-16 h-16 rounded-full bg-green-600 border-none cursor-pointer text-white text-3xl'
        confirmBtn.textContent = '✓'
        document.body.appendChild(confirmBtn)
        currentPhoto.confirmBtn = confirmBtn
        
        // Botón cancelar (tacho)
        const cancelBtn = document.createElement('button')
        cancelBtn.className = 'fixed bottom-10 left-10 z-[10001] w-16 h-16 rounded-full bg-red-600 border-none cursor-pointer text-white text-3xl'
        cancelBtn.textContent = '✕'
        document.body.appendChild(cancelBtn)
        currentPhoto.cancelBtn = cancelBtn
        
        // Confirmar: acepta la foto y cierra
        confirmBtn.onclick = () => {
          setChoseColor(false)
          setImage(currentPhoto.dataUrl)
          cleanup()
        }
        
        // Cancelar: descarta la foto y sigue con la cámara
        cancelBtn.onclick = () => {
          document.body.removeChild(canvas)
          document.body.removeChild(confirmBtn)
          document.body.removeChild(cancelBtn)
          currentPhoto = null
          video.style.display = 'block'
          captureBtn.style.display = 'block'
        }
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara')
    }
  }

  // =====================
  // RENDERIZADO
  // =====================
return (
    <div className='flex flex-col items-center min-h-screen w-full p-10'>
      <NavBar />
      <BackButton onClick={() => navigate('/profiles')} />
      
      {/* Título dinámico según sea nuevo o edición */}
      <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-4 text-center">
        {isNew ? 'NUEVO PERFIL' : 'EDITAR PERFIL'}
      </h1>
      
      {error && (
        <p className="text-red-400 text-center mb-4">{error}</p>
      )}
      
      {/* Avatar/Preview del perfil */}
      <div 
        className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-zinc-700 flex items-center justify-center text-5xl mb-6 cursor-pointer overflow-hidden"
        style={{ background: choseColor ? color : (image ? 'transparent' : '#222') }}
      >
        {image ? (
          // Si hay imagen, la mostramos
          <img src={image} alt="Preview" className="w-full h-full object-cover rounded-full" />
        ) : (
          // Si no hay imagen, mostramos la inicial
          <span className="text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>
            {name.charAt(0).toUpperCase() || '?'}
          </span>
        )}
      </div>
      
      {/* Botones para elegir foto */}
      <div className="flex gap-3 mb-4">
        {/* Botón cámara: abre la cámara del dispositivo */}
        <button
          className="bg-zinc-800 border border-zinc-600 text-zinc-300 text-sm py-3 px-6 rounded-md cursor-pointer transition-all hover:border-green-400 hover:text-green-400"
          onClick={handleCamera}
        >
          Cámara
        </button>
        
        {/* Botón galería: abre el selector de archivos */}
        <button
          className="bg-zinc-800 border border-zinc-600 text-zinc-300 text-sm py-3 px-6 rounded-md cursor-pointer transition-all hover:border-green-400 hover:text-green-400"
          onClick={() => fileInputRef.current?.click()}
        >
          Galería
        </button>
      </div>
      
      {/* Input de archivo oculto (se activa con el botón de galería) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"         // Solo acepta imágenes
        capture="user"           // En móviles, abre la cámara frontal
        className="hidden"        // Oculto
        onChange={handleImageSelect}  // Cuando se selecciona un archivo
      />
      
      {/* Selector de colores */}
      <div className="flex gap-4 my-6">
        {COLORS.map((c, i) => (
          <div
            key={i}
            className={`w-12 h-12 rounded-full cursor-pointer border-4 border-transparent transition-all hover:scale-110 ${color === c && choseColor ? 'border-white scale-110' : ''}`}
            style={{ background: c }}  // Color de fondo
            onClick={() => handleColorSelect(c)}  // Al tocar, selecciona ese color
          />
        ))}
      </div>
      
      {/* Campo nombre */}
      <input
        className="w-full max-w-md bg-transparent border-2 border-zinc-600 text-white text-sm p-4 rounded-lg outline-none text-center mb-4 focus:border-green-400 placeholder-zinc-500"
        placeholder="Nombre del perfil"
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={15}  // Máximo 15 caracteres
      />
      
      {/* Botón guardar */}
      <button
        className="w-full max-w-md mt-3 mb-3 bg-transparent border-2 border-green-600 text-green-600 text-base py-4 px-10 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={handleSave}
        disabled={!name.trim() || isSaving}
      >
        {isSaving ? 'Guardando...' : 'Guardar'}
      </button>
      
      {/* Botón eliminar (solo visible al editar, no al crear) */}
      {!isNew && (
        <button
          className="w-full max-w-md mt-3 bg-transparent border-2 border-red-700 text-red-700 text-base py-4 px-10 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-red-700 hover:text-white disabled:opacity-50"
          onClick={handleDelete}
          disabled={isSaving}
        >
          Eliminar perfil
        </button>
      )}
    </div>
  )
}
