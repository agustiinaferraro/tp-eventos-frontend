// =====================
// AuthContext.jsx - Contexto de Autenticación y Datos de Usuario
// =====================

import React, { createContext, useContext, useState, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAyBKmJoZ4AOxfoob5BNTVD_5yDiWHNXbY",
  authDomain: "eventos-5c6e2.firebaseapp.com",
  projectId: "eventos-5c6e2",
  storageBucket: "eventos-5c6e2.firebasestorage.app",
  messagingSenderId: "384718750905",
  appId: "1:384718750905:web:b072faacb5a65f269d4768"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState([])
  const [currentProfile, setCurrentProfile] = useState(null)
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])
  
  useEffect(() => {
    if (user?.uid) {
      const savedProfiles = localStorage.getItem('profiles_' + user.uid)
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles))
      }
      
      const savedCurrentProfile = localStorage.getItem('currentProfile')
      if (savedCurrentProfile) {
        setCurrentProfile(JSON.parse(savedCurrentProfile))
      }
    }
  }, [user])
  
  const value = {
    user,
    loading,
    auth,
    db,
    profiles,
    currentProfile,
    setProfiles,
    setCurrentProfile
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export { auth, db }