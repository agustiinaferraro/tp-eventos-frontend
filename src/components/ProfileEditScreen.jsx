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
// db: instancia de Firestore
import { useAuth, db } from '../context/AuthContext'

// Funciones de Firestore
import { doc, getDoc, setDoc } from 'firebase/firestore'

// COLORS: array de colores predefinidos desde constants
import { COLORS } from '../constants'

// Componente principal
export default function ProfileEditScreen() {
  // Obtenemos el usuario actual
  const { user } = useAuth()
  
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
  
  // useRef para manipular el input de archivo directamente
  const fileInputRef = useRef(null)

  // =====================
  // EFECTO: CARGAR PERFIL EXISTENTE
  // =====================
  useEffect(() => {
    loadCurrentProfile()
  }, [])  // Array vacío = solo se ejecuta al montar el componente

  // =====================
  // FUNCIÓN: CARGAR PERFIL A EDITAR
  // =====================
  const loadCurrentProfile = async () => {
    if (!user?.uid) return
    
    // Cargamos perfiles desde localStorage
    const saved = localStorage.getItem('profiles_' + user.uid)
    let localProfiles = saved ? JSON.parse(saved) : []
    
    try {
      // Intentamos cargar desde Firestore
      const docSnap = await getDoc(doc(db, 'users', user.uid))
      if (docSnap.exists() && docSnap.data().profiles) {
        localProfiles = docSnap.data().profiles
      }
    } catch (e) {}
    
    setProfiles(localProfiles)
    
    // Si estamos editando (no creando), precargamos los datos del perfil
    if (!isNew && localProfiles[editingIndex]) {
      const p = localProfiles[editingIndex]
      setName(p.name)
      if (p.image) {
        setImage(p.image)
      } else {
        setColor(p.color || COLORS[0])
        setChoseColor(true)
      }
    }
  }

  // =====================
  // FUNCIÓN: GUARDAR PERFILES
  // =====================
  const saveProfiles = async (newProfiles) => {
    // Guarda en localStorage y Firestore
    localStorage.setItem('profiles_' + user.uid, JSON.stringify(newProfiles))
    await setDoc(doc(db, 'users', user.uid), { profiles: newProfiles }, { merge: true })
  }

  // =====================
  // FUNCIÓN: GUARDAR PERFIL
  // =====================
  const handleSave = async () => {
    // Construimos el objeto del perfil
    const profileData = {
      name: name.trim(),  // trim() elimina espacios al inicio y final
      
      // Lógica para el color:
      // - Si eligió un color específicamente, usar ese color
      // - Si tiene imagen, el color es null
      // - Si es nuevo y no tiene imagen, usar el color por defecto
      // - Si está editando, mantener el color original
      color: choseColor ? color : (image ? null : (isNew ? color : profiles[editingIndex]?.color)),
      
      image: image  // La imagen en base64 o null
    }
    
    // Copiamos el array de perfiles
    let newProfiles = [...profiles]
    
    if (isNew) {
      // Modo creación: agregamos al final
      newProfiles.push(profileData)
    } else {
      // Modo edición: reemplazamos en la posición del índice
      newProfiles[editingIndex] = profileData
    }
    
    // Guardamos y navegamos de vuelta a la lista de perfiles
    await saveProfiles(newProfiles)
    navigate('/profiles')
  }

  // =====================
  // FUNCIÓN: ELIMINAR PERFIL
  // =====================
  const handleDelete = async () => {
    if (confirm('¿Eliminar este perfil?')) {
      let newProfiles = [...profiles]
      // splice(index, 1) elimina 1 elemento en esa posición
      newProfiles.splice(editingIndex, 1)
      await saveProfiles(newProfiles)
      navigate('/profiles')
    }
  }

  // =====================
  // FUNCIÓN: SELECCIONAR IMAGEN DE GALERÍA
  // =====================
  const handleImageSelect = (e) => {
    const file = e.target.files[0]  // Obtenemos el primer archivo seleccionado
    
    if (!file) return  // Si no hay archivo, salimos
    
    setChoseColor(false)  // Al seleccionar imagen, no está usando color
    
    // FileReader permite leer archivos del sistema
    const reader = new FileReader()
    
    // Cuando termine de leer, guardamos el resultado (base64)
    reader.onload = (ev) => setImage(ev.target.result)
    
    // Iniciamos la lectura del archivo como Data URL (base64)
    reader.readAsDataURL(file)
  }

  // =====================
  // FUNCIÓN: SELECCIONAR COLOR
  // =====================
  const handleColorSelect = (c) => {
    setChoseColor(true)   // Marcamos que eligió un color
    setColor(c)           // Establecemos el color seleccionado
    setImage(null)        // Limpiamos cualquier imagen (color e imagen son excluyentes)
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
        audio: false  // No necesitamos audio
      })
      
      // Creamos un elemento de video dinámicamente
      const video = document.createElement('video')
      video.srcObject = stream  // Conectamos el stream de la cámara
      video.className = 'fixed top-0 left-0 w-full h-full z-[9999] bg-black object-cover'
      video.play()  // Empezamos a reproducir
      
      // Agregamos el video al body para que se vea
      document.body.appendChild(video)
      
      // Botón para capturar la foto
      const captureBtn = document.createElement('button')
      captureBtn.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] w-20 h-20 rounded-full bg-white border-none cursor-pointer text-4xl'
      document.body.appendChild(captureBtn)
      
      // Botón para cerrar la cámara
      const closeBtn = document.createElement('button')
      closeBtn.className = 'fixed top-5 right-5 z-[10001] w-12 h-12 rounded-full bg-white/20 text-white text-xl border-none cursor-pointer'
      document.body.appendChild(closeBtn)

      // Función de limpieza: cierra la cámara y elimina los elementos
      const cleanup = () => {
        stream.getTracks().forEach(t => t.stop())  // Detiene todos los tracks de video
        document.body.removeChild(video)
        document.body.removeChild(captureBtn)
        document.body.removeChild(closeBtn)
      }
      
      // Al cerrar, llamamos cleanup
      closeBtn.onclick = cleanup
      
      // Al capturar, tomamos la foto
      captureBtn.onclick = () => {
        // Creamos un canvas (lienzo) para dibujar la imagen
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth   // Ancho del video
        canvas.height = video.videoHeight  // Alto del video
        
        // Dibujamos el frame actual del video en el canvas
        canvas.getContext('2d').drawImage(video, 0, 0)
        
        // Convertimos el canvas a imagen JPEG en base64
        setChoseColor(false)
        setImage(canvas.toDataURL('image/jpeg'))
        
        cleanup()  // Limpiamos todo
      }
    } catch (err) {
      // Si hay error (no hay cámara, no dio permisos, etc)
      alert('No se pudo acceder a la cámara')
    }
  }

  // =====================
  // RENDERIZADO
  // =====================
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-10">
      
      {/* Botón volver atrás */}
      <button
        className="absolute top-8 left-8 text-5xl text-white bg-transparent border-none cursor-pointer hover:opacity-70"
        onClick={() => navigate('/profiles')}
      >
        ‹
      </button>
      
      {/* Título dinámico según sea nuevo o edición */}
      <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-16 text-center">
        {isNew ? 'NUEVO PERFIL' : 'EDITAR PERFIL'}
      </h1>
      
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
        disabled={!name.trim()}  // Deshabilitado si el nombre está vacío
      >
        Guardar
      </button>
      
      {/* Botón eliminar (solo visible al editar, no al crear) */}
      {!isNew && (
        <button
          className="w-full max-w-md mt-3 bg-transparent border-2 border-red-700 text-red-700 text-base py-4 px-10 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-red-700 hover:text-white"
          onClick={handleDelete}
        >
          Eliminar perfil
        </button>
      )}
    </div>
  )
}
