// =====================
// AuthScreen.jsx - Pantalla de Login y Registro
// =====================

// Importamos React y los hooks useState (para estado) y useEffect (para efectos secundarios)
import React, { useState, useEffect } from 'react'

// useNavigate es un hook de React Router para navegar programáticamente entre rutas
import { useNavigate } from 'react-router-dom'

// useAuth nos da acceso al usuario actual desde el contexto de autenticación
// auth es la instancia de Firebase Authentication
import { useAuth, auth } from '../context/AuthContext'

// Funciones de Firebase para autenticación:
// - signInWithEmailAndPassword: iniciar sesión con email y contraseña
// - createUserWithEmailAndPassword: crear nueva cuenta
// - signOut: cerrar sesión
// - sendPasswordResetEmail: enviar email para restablecer contraseña
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth'

// Componente principal de la pantalla de autenticación
export default function AuthScreen() {
  // Obtenemos el usuario actual del contexto (null si no está logueado)
  const { user } = useAuth()
  
  // Hook para navegar a otras rutas
  const navigate = useNavigate()

  // =====================
  // ESTADOS DEL FORMULARIO DE LOGIN
  // =====================
  const [email, setEmail] = useState('')           // Email ingresado
  const [password, setPassword] = useState('')     // Contraseña ingresada
  const [error, setError] = useState('')          // Mensaje de error de login
  const [success, setSuccess] = useState('')      // Mensaje de éxito de login

  // =====================
  // ESTADOS DEL FORMULARIO DE REGISTRO
  // =====================
  const [isRegister, setIsRegister] = useState(false)  // Si estamos en modo registro
  const [regName, setRegName] = useState('')          // Nombre del nuevo usuario
  const [regEmail, setRegEmail] = useState('')        // Email del nuevo usuario
  const [regPassword, setRegPassword] = useState('')  // Contraseña del nuevo usuario
  const [regConfirm, setRegConfirm] = useState('')    // Confirmación de contraseña
  const [regError, setRegError] = useState('')       // Mensaje de error de registro

  // =====================
  // EFECTO: REDIRIGIR SI YA ESTÁ LOGUEADO
  // =====================
  // useEffect se ejecuta cada vez que 'user' o 'navigate' cambian
  useEffect(() => {
    // Si el usuario ya está logueado, lo redirigimos a la pantalla de perfiles
    if (user) {
      navigate('/profiles')
    }
  }, [user, navigate])  // Dependencias: se ejecuta cuando user o navigate cambian

  // =====================
  // FUNCIÓN: MANEJAR LOGIN
  // =====================
  const handleLogin = async () => {
    // Validación: ambos campos obligatorios
    if (!email || !password) {
      setError('Completá todos los campos')
      return  // Sale de la función sin continuar
    }
    
    // Limpiamos errores anteriores
    setError('')
    
    try {
      // Intentamos iniciar sesión con Firebase
      await signInWithEmailAndPassword(auth, email, password)
      
      // Si tiene éxito, guardamos el email en localStorage para "recordar cuentas"
      const savedEmails = JSON.parse(localStorage.getItem('savedAccounts') || '[]')
      if (!savedEmails.includes(email)) {
        savedEmails.push(email)  // Agregamos el email a la lista
        localStorage.setItem('savedAccounts', JSON.stringify(savedEmails))  // Guardamos
      }
      
      // También guardamos el último email usado (para autocompletar después)
      localStorage.setItem('lastEmail', email)
      
      // Firebase automáticamente actualiza el usuario, lo que dispara el useEffect
      // que redirige a /profiles
      
    } catch (err) {
      // Si hay un error, mostramos un mensaje amigable
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos')
      } else {
        setError('Error: ' + err.code)  // Mostramos el código de error de Firebase
      }
    }
  }

  // =====================
  // FUNCIÓN: MANEJAR REGISTRO
  // =====================
  const handleRegister = async () => {
    // Limpiamos errores anteriores
    setRegError('')
    
    // Validaciones una por una:
    // 1. Nombre debe tener al menos 2 caracteres
    if (regName.trim().length < 2) {
      setRegError('El nombre debe tener al menos 2 caracteres')
      return
    }
    // 2. Email debe contener @
    if (!regEmail.includes('@')) {
      setRegError('Ingresá un email válido')
      return
    }
    // 3. Contraseña debe tener al menos 1 mayúscula
    if (!/[A-Z]/.test(regPassword)) {
      setRegError('La contraseña debe tener al menos 1 mayúscula')
      return
    }
    // 4. Contraseña debe tener al menos 1 número
    if (!/[0-9]/.test(regPassword)) {
      setRegError('La contraseña debe tener al menos 1 número')
      return
    }
    // 5. Las contraseñas deben coincidir
    if (regPassword !== regConfirm) {
      setRegError('Las contraseñas no coinciden')
      return
    }
    
    try {
      // Creamos la cuenta en Firebase
      const cred = await createUserWithEmailAndPassword(auth, regEmail, regPassword)
      
      // Actualizamos el perfil del usuario con su nombre
      await cred.user.updateProfile({ displayName: regName.trim() })
      
      // Enviamos email de verificación (Firebase lo envía automáticamente)
      await sendPasswordResetEmail(auth, regEmail)
      
      // Guardamos la cuenta en localStorage
      const savedEmails = JSON.parse(localStorage.getItem('savedAccounts') || '[]')
      if (!savedEmails.includes(regEmail)) {
        savedEmails.push(regEmail)
        localStorage.setItem('savedAccounts', JSON.stringify(savedEmails))
      }
      
      // Mostramos mensaje de éxito
      setRegError('¡Cuenta creada! Verificá tu email')
      
      // Después de 2 segundos: cerramos sesión, volvemos al login, y prellenamos el email
      setTimeout(() => {
        signOut(auth)  // Cerramos sesión (el usuario necesita verificar email primero)
        setIsRegister(false)  // Volvemos al formulario de login
        setEmail(regEmail)   // Prellenamos el email para que facilite el login
      }, 2000)
      
    } catch (err) {
      // Manejo de errores específicos
      if (err.code === 'auth/email-already-in-use') {
        setRegError('Este email ya está registrado')
      } else {
        setRegError('Error: ' + err.code)
      }
    }
  }

  // =====================
  // FUNCIÓN: RECUPERAR CONTRASEÑA
  // =====================
  const handleForgotPassword = async () => {
    // Validamos que haya un email ingresado
    if (!email || !email.includes('@')) {
      setError('Ingresá tu email arriba')
      return
    }
    
    try {
      // Firebase envía un email con enlace para restablecer la contraseña
      await sendPasswordResetEmail(auth, email)
      setSuccess('Revisá tu email para restablecer la contraseña')
      setError('')  // Limpiamos cualquier error anterior
    } catch (err) {
      setError('Error: ' + err.message)
    }
  }

  // =====================
  // RENDERIZADO CONDICIONAL
  // =====================
  // Si estamos en modo registro, mostramos el formulario de registro
  if (isRegister) {
    return (
      // Contenedor centrado en la pantalla
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-10">
        
        {/* Botón para volver al login (flecha hacia la izquierda) */}
        <button
          className="absolute top-8 left-8 text-5xl text-white bg-transparent border-none cursor-pointer hover:opacity-70"
          onClick={() => setIsRegister(false)}
        >
          ‹
        </button>
        
        {/* Título del formulario */}
        <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-16 text-center">
          CREAR CUENTA
        </h1>
        
        {/* Campo: Nombre */}
        <input
          className="w-full max-w-md bg-transparent border-2 border-zinc-600 text-white text-sm p-4 rounded-lg outline-none text-center mb-4 focus:border-green-400 placeholder-zinc-500"
          placeholder="Tu nombre"
          value={regName}
          onChange={e => setRegName(e.target.value)}  // Actualiza el estado con cada tecla
        />
        
        {/* Campo: Email */}
        <input
          className="w-full max-w-md bg-transparent border-2 border-zinc-600 text-white text-sm p-4 rounded-lg outline-none text-center mb-4 focus:border-green-400 placeholder-zinc-500"
          placeholder="Email"
          value={regEmail}
          onChange={e => setRegEmail(e.target.value)}
        />
        
        {/* Campo: Contraseña */}
        <input
          className="w-full max-w-md bg-transparent border-2 border-zinc-600 text-white text-sm p-4 rounded-lg outline-none text-center mb-1 focus:border-green-400 placeholder-zinc-500"
          type="password"
          placeholder="Contraseña"
          value={regPassword}
          onChange={e => setRegPassword(e.target.value)}
        />
        
        {/* Hint: Requisitos de contraseña */}
        <p className="text-xs text-zinc-600 mb-4 tracking-wider w-full max-w-md">
          Mínimo 6 caracteres, 1 mayúscula y 1 número
        </p>
        
        {/* Campo: Confirmar Contraseña */}
        <input
          className="w-full max-w-md bg-transparent border-2 border-zinc-600 text-white text-sm p-4 rounded-lg outline-none text-center mb-4 focus:border-green-400 placeholder-zinc-500"
          type="password"
          placeholder="Confirmar contraseña"
          value={regConfirm}
          onChange={e => setRegConfirm(e.target.value)}
        />
        
        {/* Mensaje de error de registro */}
        <p className="text-red-500 text-xs mt-3 text-center min-h-5">{regError}</p>
        
        {/* Botón: Crear Cuenta */}
        <button
          className="w-full max-w-md mt-3 mb-3 bg-transparent border-2 border-green-400 text-white text-base py-4 px-10 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-green-600 hover:border-green-600 hover:scale-105 active:scale-95"
          onClick={handleRegister}
        >
          CREAR CUENTA
        </button>
      </div>
    )
  }

  // =====================
  // FORMULARIO DE LOGIN (por defecto)
  // =====================
  return (
    // Contenedor centrado en la pantalla
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-10">
      
      {/* Título principal de la app */}
      <h1 className="text-2xl md:text-4xl tracking-widest text-green-400 mb-16 text-center">
        ENERGÍA COLECTIVA
      </h1>
      
      {/* Campo: Email */}
      <input
        className="w-full max-w-md bg-transparent border-2 border-zinc-600 text-white text-sm p-4 rounded-lg outline-none text-center mb-4 focus:border-green-400 placeholder-zinc-500"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}  // onChange: se ejecuta cada vez que el usuario escribe
        autoComplete="off"  // Desactivamos autocompletado del navegador
      />
      
      {/* Campo: Contraseña */}
      <input
        className="w-full max-w-md bg-transparent border-2 border-zinc-600 text-white text-sm p-4 rounded-lg outline-none text-center mb-4 focus:border-green-400 placeholder-zinc-500"
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="off"
      />
      
      {/* Botón: Entrar */}
      {/* disabled: el botón está deshabilitado hasta que email tenga @ y password tenga 6+ caracteres */}
      <button
        className="w-full max-w-md mt-3 mb-3 bg-transparent border-2 border-green-400 text-white text-base py-4 px-10 rounded-lg cursor-pointer tracking-wider transition-all hover:bg-green-600 hover:border-green-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        onClick={handleLogin}
        disabled={!email.includes('@') || password.length < 6}
      >
        ENTRAR
      </button>
      
      {/* Enlace: ¿Olvidaste tu contraseña? */}
      <button
        className="bg-transparent border-none text-green-400 text-sm cursor-pointer mt-5 tracking-wider transition-all hover:text-green-300 hover:scale-105 active:scale-95"
        onClick={handleForgotPassword}
      >
        ¿Olvidaste tu contraseña?
      </button>
      
      {/* Enlace: Crear cuenta */}
      <button
        className="bg-transparent border-none text-green-400 text-sm cursor-pointer mt-8 tracking-wider transition-all hover:text-green-300 hover:scale-105 active:scale-95"
        onClick={() => setIsRegister(true)}  // Cambiamos a modo registro
      >
        ¿No tenés cuenta? Creá una
      </button>
      
      {/* Mensaje de error de login */}
      <p className="text-red-500 text-xs mt-3 text-center min-h-5">{error}</p>
      
      {/* Mensaje de éxito (solo se muestra si success tiene contenido) */}
      {success && <p className="text-green-400 text-xs mt-3 text-center">{success}</p>}
    </div>
  )
}
