// Backend API utility

const API_BASE = 'https://tp-eventos-backend-production.up.railway.app';

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

// Generar imagen con IA usando Puter.js (gratis, sin API key, nano-banana powered)
export async function generateImageWithAI(prompt) {
  try {
    if (!window.puter) {
      throw new Error('Puter no está cargado');
    }
    
    // Generate usando Puter.js con GPT Image
    const result = await window.puter.ai.chat.completions.create({
      model: 'gpt-image-1',
      messages: [{ role: 'user', content: `Generate an image: ${prompt}` }]
    });
    
    if (result?.image_url) {
      return result.image_url;
    }
    
    throw new Error('No se pudo generar la imagen');
  } catch (error) {
    throw new Error('Error al generar imagen: ' + error.message);
  }
}
