// Conexión al servidor backend (Socket.IO)
// IMPORTANTE: usar la IP local para que funcione en celular
const socket = io("http://192.168.100.9:3000");

// Referencias a elementos del DOM
const pointsEl = document.getElementById("points");
const bar = document.getElementById("bar");

// Escucha del estado global enviado por el backend
socket.on("stateUpdate", (data) => {

  // Cambia el color de fondo según el estado
  document.body.style.background = data.color;

  // Actualiza los puntos en pantalla
  pointsEl.innerText = Math.floor(data.points);

  // Calcula el progreso (máximo 1000)
  const progress = Math.min(data.points / 1000, 1);

  // Actualiza el ancho de la barra
  bar.style.width = (progress * 100) + "%";
});

// Evento de interacción del usuario (click en pantalla)
document.body.addEventListener("click", () => {

  // Envía energía al backend
  socket.emit("energy", { energy: 10 });
});

// Reset del sistema con tecla "R"
document.addEventListener("keydown", (e) => {

  if (e.key === "r") {

    // Envía evento de reset al backend
    socket.emit("reset");
  }
});