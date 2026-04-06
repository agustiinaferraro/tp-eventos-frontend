// =====================
// main.jsx - Punto de Entrada de React
// =====================

// Importamos React (necesario para usar JSX y componentes)
import React from 'react'

// ReactDOM es la librería que conecta React con el DOM del navegador
import ReactDOM from 'react-dom/client'

// Importamos nuestro componente principal App
import App from './App.jsx'

// Importamos los estilos CSS (Tailwind)
import './index.css'

// =====================
// PUNTO DE ENTRADA
// =====================
// createRoot: Crea un punto de entrada para React en el elemento 'root'
// Este elemento está definido en index.html como: <div id="root"></div>
ReactDOM.createRoot(document.getElementById('root')).render(
  // React.StrictMode: Activa checks y advertencias en desarrollo
  // Ayuda a encontrar problemas en el código (deprecated APIs, efectos secundarios, etc.)
  <React.StrictMode>
    {/* El componente App se renderiza dentro del root */}
    <App />
  </React.StrictMode>,
)
