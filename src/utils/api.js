// Backend API utility

const API_BASE = 'http://localhost:3000';

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function apiPost(path, data) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// API: Experiencia de sala
export async function apiGetExperience(salaName) {
  return apiGet(`/api/salas/${salaName}/experience`);
}

export async function apiSaveExperience(salaName, experience) {
  return apiPost(`/api/salas/${salaName}/experience`, { experience });
}

// Generar imagen con IA usando Puter.js (gratis, sin API key, nano-banana powered)
export async function generateImageWithAI(prompt) {
  try {
    if (!window.puter) {
      throw new Error('Puter no está cargado');
    }
    
    // Generate usando Puter.js txt2img con nano-banana
    const imageElement = await window.puter.ai.txt2img(prompt, {
      model: "gemini-2.5-flash-image-preview"
    });
    
    if (imageElement && imageElement.src) {
      return imageElement.src;
    }
    
    throw new Error('No se pudo generar la imagen');
  } catch (error) {
    throw new Error('Error al generar imagen: ' + error.message);
  }
}
