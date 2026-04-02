const fs = require('fs');
const { execSync } = require('child_process');

function getLocalIP() {
  try {
    const output = execSync('ipconfig', { encoding: 'utf8' });
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('IPv4') && line.includes('192.168.')) {
        const match = line.match(/\d+\.\d+\.\d+\.\d+/);
        if (match) {
          return match[0];
        }
      }
    }
  } catch (e) {
    console.error('Error detectando IP:', e.message);
  }
  return null;
}

const ip = getLocalIP();

if (ip) {
  const envContent = `VITE_SERVER_URL=http://${ip}:3000\n`;
  fs.writeFileSync('.env', envContent);
  console.log(`IP detectada: ${ip}`);
  console.log('.env actualizado automaticamente');
} else {
  console.error('No se pudo detectar la IP. Verifica tu conexion de red.');
}
