// =====================
// AuthContext.jsx - Contexto de Autenticación
// =====================

// Importamos React y las herramientas de contexto
import React, { createContext, useContext, useState, useEffect } from 'react'

// Importamos las funciones de Firebase para inicializar la app
import { initializeApp } from 'firebase/app'

// Importamos los servicios de Firebase: autenticación y base de datos
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuración de Firebase - conecta con el proyecto en Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAyBKmJoZ4AOxfoob5BNTVD_5yDiWHNXbY",      // Clave API pública
  authDomain: "eventos-5c6e2.firebaseapp.com",              // Dominio de autenticación
  projectId: "eventos-5c6e2",                               // ID del proyecto en Firebase
  storageBucket: "eventos-5c6e2.firebasestorage.app",       // Bucket de almacenamiento
  messagingSenderId: "384718750905",                        // ID del remitente para notifications
  appId: "1:384718750905:web:b072faacb5a65f269d4768"       // ID de la aplicación web
}

// Inicializamos la aplicación de Firebase con la configuración
const app = initializeApp(firebaseConfig)

// Creamos las instancias de autenticación y base de datos
const auth = getAuth(app)  // Para manejar login/registro/logout
const db = getFirestore(app)  // Para guardar y leer datos (perfiles, salas)

// Creamos un contexto que permitirá compartir datos de auth entre componentes
const AuthContext = createContext()

// Componente proveedor que envuelve la app
export function AuthProvider({ children }) {
  // Estado para guardar el usuario actual (null si no está logueado)
  const [user, setUser] = useState(null)
  
  // Estado para saber si todavía estamos verificando el usuario
  const [loading, setLoading] = useState(true)

  // useEffect se ejecuta una sola vez al montar el componente
  useEffect(() => {
    // nos subscribimos al estado de autenticación de Firebase
    // Esta función se llama automáticamente cuando el usuario inicia o cierra sesión
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      // Actualizamos el estado con el usuario de Firebase
      setUser(firebaseUser)
      // Ya terminamos de cargar
      setLoading(false)
    })
    
    // Limpiamos la suscripción cuando el componente se desmonta
    // Esto evita memory leaks
    return unsubscribe
  }, [])  // El array vacío significa que solo se ejecuta una vez

  // Retornamos el contexto con los valores que queremos compartir
  return (
    <AuthContext.Provider value={{ user, loading, auth, db }}>
      {/* children son todos los componentes que están dentro de AuthProvider */}
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto fácilmente
// En cualquier componente podemos escribir: const { user } = useAuth()
export function useAuth() {
  return useContext(AuthContext)
}

// Exportamos auth y db para usarlos directamente donde necesitemos
// (por ejemplo, para signInWithEmailAndPassword, doc, setDoc, etc.)
export { auth, db }
