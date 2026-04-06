// =====================
// constants/index.js - Constantes Compartidas
// =====================

// Colores disponibles para elegir en el perfil
// Son 8 colores vibrantes para personalizar la experiencia
export const COLORS = [
  '#ff6b00',   // Naranja
  '#00ff88',   // Verde brillante
  '#00aaff',   // Azul
  '#ff00ff',   // Magenta
  '#ffff00',   // Amarillo
  '#ff3366',   // Rosa/Rojo
  '#33ff99',   // Verde menta
  '#9966ff'    // Púrpura
]

// URL local para desarrollo
// Esta es la dirección donde corre Vite durante desarrollo
export const LOCAL_URL = "https://localhost:5173"

// =====================
// FUNCIÓN: OBTENER URL BASE
// =====================
// Esta función determina cuál es la URL de producción
// dependiendo de dónde esté corriendo la aplicación
export function getBaseUrl() {
  // 1. Primero: ¿El usuario guardó una URL personalizada?
  //    (Por ejemplo, una URL de ngrok para probar en celular)
  const saved = localStorage.getItem('publicUrl')
  if (saved) return saved
  
  // 2. Segundo: ¿Estamos en Vercel (producción)?
  //    Si el hostname incluye 'vercel.app', usamos la URL actual
  if (window.location.hostname.includes('vercel.app')) {
    return window.location.origin
  }
  
  // 3. Por defecto: Usamos la URL de desarrollo local
  return LOCAL_URL
}
