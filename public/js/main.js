(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const salaParam = urlParams.get("sala");
  
  if (!salaParam) {
    return;
  }
  
  const SERVER_URL = "https://tp-eventos-backend-production.up.railway.app";

  let currentGesture = null;
  let gestureActive = false;
  let nearThresholdActive = false;
  let myRepetitions = 0;
  let lastAccelY = 0;
  let gesturePhase = 0;
  let pumpCount = 0;
  let lastPumpTime = 0;
  let gestureStartTime = 0;
  let lastEnergyTime = 0;
  let accelerometerEnabled = false;
  let motionEnabled = false;
  let movementConsecutiveCount = 0;
  let lastMovementDirection = null;
  let lastBeta = 0;
  let pumpUpDetected = false;
  let lastSignificantMotion = 0;
  let boostActive = false;
  let currentBoostTarget = 0;
  let boostMultiplier = 1;
  let level2Unlocked = false;
  let level3Unlocked = false;
  let sensorInitTime = 0;
  let sensorInitComplete = false;
  let isFirstReading = true;
  let pendingEnergy = 0;

  const OFFLINE_KEY = 'pendingEnergy_' + salaParam;

  function getPendingEnergy() {
    return parseInt(localStorage.getItem(OFFLINE_KEY) || '0');
  }

  function clearPendingEnergy() {
    pendingEnergy = 0;
    localStorage.removeItem(OFFLINE_KEY);
    updateOfflineIndicator();
  }

  function sendPendingEnergy() {
    const pending = getPendingEnergy();
    if (pending > 0) {
      const syncing = document.getElementById("syncingEnergy");
      const offline = document.getElementById("offlineEnergy");
      if (offline) offline.classList.add("hidden");
      if (syncing) {
        syncing.classList.remove("hidden");
        syncing.textContent = "🔄 Enviando " + pending + " puntos...";
      }
      
      socket.emit("energy", { energy: pending });
      
      setTimeout(() => {
        clearPendingEnergy();
        if (syncing) {
          syncing.classList.add("hidden");
        }
      }, 1000);
    }
  }

  function updateOfflineIndicator() {
    const indicator = document.getElementById("offlineEnergy");
    const count = document.getElementById("offlineEnergyCount");
    const pending = getPendingEnergy();
    if (pending > 0) {
      count.textContent = pending;
      indicator.classList.remove("hidden");
    } else {
      indicator.classList.add("hidden");
    }
  }

  function savePendingEnergy(energy) {
    pendingEnergy += energy;
    localStorage.setItem(OFFLINE_KEY, pendingEnergy.toString());
    updateOfflineIndicator();
  }

  function trySendEnergy(energy) {
    savePendingEnergy(energy);
    if (socket.connected) {
      socket.emit("energy", { energy: energy });
    }
  }

  window.addEventListener('offline', () => {
    connectionStatus.classList.remove("connected");
    connectionText.textContent = "SIN CONEXIÓN";
    updateOfflineIndicator();
  });

  window.addEventListener('online', () => {
    updateOfflineIndicator();
  });

  const boostOverlay = document.getElementById("boostOverlay");
  const boostTargetEl = document.getElementById("boostTarget");
  const unlockEffects = document.getElementById("unlockEffects");
  const effectsParticles = document.getElementById("effectsParticles");
  const effectsSubtitle = document.getElementById("effectsSubtitle");
  const effectsContainer = document.getElementById("effectsContainer");
  const effectsParticlesBurst = document.getElementById("effectsParticlesBurst");

  const pointsEl = document.getElementById("points");
  const bar = document.getElementById("bar");
  const connectionStatus = document.getElementById("connectionStatus");
  const connectionText = document.getElementById("connectionText");
  const titleEl = document.getElementById("eventTitle");
  const gestureOverlay = document.getElementById("gestureOverlay");
  const gestureIcon = document.getElementById("gestureIcon");
  const gestureName = document.getElementById("gestureName");
  const gestureTimer = document.getElementById("gestureTimer");
  const gestureInstruction = document.getElementById("gestureInstruction");
  const gestureFeedback = document.getElementById("gestureFeedback");
  const feedbackFill = document.getElementById("feedbackFill");
  const feedbackText = document.getElementById("feedbackText");
  const gestureSuccess = document.getElementById("gestureSuccess");
  const gestureFailed = document.getElementById("gestureFailed");
  const nearThresholdOverlay = document.getElementById("nearThresholdOverlay");
  const thresholdCount = document.getElementById("thresholdCount");
  const motionIndicator = document.getElementById("motionIndicator");
  const tiltIndicator = document.getElementById("tiltIndicator");
  const pumpsToGoEl = document.getElementById("pumpsToGo");

  const THRESHOLDS = [0, 125, 250, 375, 500, 625, 750, 875, 1000];

  function getNextThreshold(currentPoints) {
    for (const threshold of THRESHOLDS) {
      if (currentPoints < threshold) return threshold;
    }
    return 1000;
  }

  const socket = io(SERVER_URL, {
    query: { room: salaParam },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });

  updateOfflineIndicator();

  socket.on("connect", () => {
    connectionStatus.classList.add("connected");
    connectionText.textContent = "CONECTADO";
    sendPendingEnergy();
  });

  socket.on("disconnect", () => {
    connectionStatus.classList.remove("connected");
    connectionText.textContent = "SIN CONEXIÓN";
    updateOfflineIndicator();
  });

  if (titleEl) {
    const salaName = salaParam.replace(/\b\w/g, l => l.toUpperCase());
    titleEl.textContent = salaName;
  }

  effectsContainer.classList.add('active', 'level-1');
  document.body.classList.add('effects-active');
  createContinuousParticles();

  let lastProgress = 0;
  socket.on("stateUpdate", (data) => {
    const colorClass = data.color;
    pointsEl.innerText = Math.floor(data.points);
    pointsEl.className = colorClass;
    const progress = Math.min(data.points / 1000, 1);
    const newWidth = (progress * 100) + "%";
    
    if (progress >= lastProgress) {
      bar.classList.add("transition-all", "duration-300");
      bar.style.width = newWidth;
    } else {
      bar.classList.remove("transition-all", "duration-300");
      bar.style.width = newWidth;
    }
    lastProgress = progress;
    
    bar.className = `${colorClass} h-full rounded`;

    const points = data.points;

    if (data.points >= 1000) {
      pumpsToGoEl.innerHTML = '¡COMPLETADO!';
      pumpsToGoEl.style.color = '#00ff88';
      tiltIndicator.style.display = 'none';
      boostOverlay.classList.remove('active');
      if (!level3Unlocked) {
        level3Unlocked = true;
        effectsContainer.classList.remove('level-1', 'level-2');
        effectsContainer.classList.add('level-3');
        document.body.classList.remove('effects-active', 'effects-level-2');
        document.body.classList.add('effects-level-3');
        createContinuousParticles();
        showUnlockEffects('¡NIVEL FINAL!', 3);
      }
    } else if (data.gestureActive) {
      pumpsToGoEl.innerHTML = '¡HACÉ EL GESTO!';
      pumpsToGoEl.style.color = '#ff6b00';
      tiltIndicator.style.display = 'none';
      boostOverlay.classList.remove('active');
    } else {
      if (points >= 400 && points < 500 && !boostActive) {
        boostActive = true;
        currentBoostTarget = 500;
        boostMultiplier = 2;
        boostTargetEl.textContent = '500';
        boostOverlay.classList.add('active');
        setTimeout(() => boostOverlay.classList.remove('active'), 2000);
      } else if (points >= 900 && points < 1000 && !boostActive) {
        boostActive = true;
        currentBoostTarget = 1000;
        boostMultiplier = 2;
        boostTargetEl.textContent = '1000';
        boostOverlay.classList.add('active');
        setTimeout(() => boostOverlay.classList.remove('active'), 2000);
      }

      if (boostActive && points >= currentBoostTarget) {
        boostActive = false;
        boostMultiplier = 1;
      }

      if (points >= 500 && !level2Unlocked) {
        level2Unlocked = true;
        effectsContainer.classList.remove('level-1');
        effectsContainer.classList.add('level-2');
        document.body.classList.remove('effects-active');
        document.body.classList.add('effects-level-2');
        createContinuousParticles();
        showUnlockEffects('¡EFECTOS DESBLOQUEADOS!', 2);
      } else if (points < 500 && level2Unlocked) {
        level2Unlocked = false;
        effectsContainer.classList.remove('level-2');
        effectsContainer.classList.add('level-1');
        document.body.classList.remove('effects-level-2');
        document.body.classList.add('effects-active');
      }

      const nextThreshold = getNextThreshold(points);
      const remaining = nextThreshold - Math.floor(points);
      let remainingColor = '#ff6b00';
      if (nextThreshold > 375) remainingColor = '#ffdd00';
      if (nextThreshold >= 1000) remainingColor = '#00ff88';
      let targetColor = '#ff6b00';
      if (nextThreshold >= 500) targetColor = '#ffdd00';
      if (nextThreshold >= 1000) targetColor = '#00ff88';
      pumpsToGoEl.innerHTML = `Faltan <span class="big-number" style="color:${remainingColor}">${remaining}</span> movimientos para llegar a los <span class="big-number" style="color:${targetColor}">${nextThreshold}</span> puntos`;
    }

    if (titleEl && data.room) {
      titleEl.textContent = data.room.toUpperCase();
      
      let titleColor = '#ff6b00';
      if (data.points >= 500) titleColor = '#ffdd00';
      if (data.points >= 1000) titleColor = '#00ff88';
      titleEl.style.color = titleColor;
    }

    if (data.gestureActive && !gestureActive) {
      showGesture(data.currentGesture, data.gestureDuration);
    }
    if (!data.gestureActive && gestureActive) {
      hideGesture();
    }
    if (data.nearThreshold && !nearThresholdActive && !gestureActive) {
      showNearThreshold();
    } else if (!data.nearThreshold && nearThresholdActive) {
      hideNearThreshold();
    }
  });

  function showGesture(gesture, duration) {
    gestureActive = true;
    currentGesture = gesture;
    gestureStartTime = Date.now();
    pumpCount = 0;
    gesturePhase = 0;
    gestureOverlay.classList.add("active");
    gestureIcon.className = "gesture-icon " + gesture;
    gestureName.textContent = gesture.toUpperCase();
    gestureInstruction.textContent = getGestureInstructions(gesture);
    gestureFeedback.classList.add("active");
    feedbackFill.style.width = "0%";
    feedbackText.textContent = "Haciendo el gesto...";
    initAccelerometer(gesture);
  }

  function hideGesture() {
    gestureActive = false;
    currentGesture = null;
    gestureOverlay.classList.remove("active");
    gestureFeedback.classList.remove("active");
  }

  function showNearThreshold() {
    nearThresholdActive = true;
    myRepetitions = 0;
    nearThresholdOverlay.classList.add("active");
    thresholdCount.textContent = "Repeticiones: 0/5";
    initAccelerometer('any');
  }

  function hideNearThreshold() {
    nearThresholdActive = false;
    nearThresholdOverlay.classList.remove("active");
  }

  function createContinuousParticles() {
    effectsParticles.innerHTML = '';
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      effectsParticles.appendChild(particle);
    }
  }

  function showUnlockEffects(title, level) {
    effectsSubtitle.textContent = level === 2 ? 'Nivel 2 activado' : '¡MODO ÉPICO!';
    effectsParticlesBurst.innerHTML = '';
    const burstCount = level === 2 ? 60 : 100;
    for (let i = 0; i < burstCount; i++) {
      const particle = document.createElement('span');
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 0.5 + 's';
      particle.style.animationDuration = (1 + Math.random() * 2) + 's';
      effectsParticlesBurst.appendChild(particle);
    }
    unlockEffects.classList.add('active');
    setTimeout(() => unlockEffects.classList.remove('active'), 3000);
  }

  function getGestureInstructions(gesture) {
    const instructions = {
      pump: "Mové el celular arriba y abajo como bombeando",
      wave: "Mové el celular de lado a lado",
      shake: "Agitá el celular rápidamente",
      rotate: "Rotá el celular en círculos"
    };
    return instructions[gesture] || "Hacé el gesto";
  }

  function initAccelerometerGlobal() {
    console.log("initAccelerometerGlobal() llamada");
    if (accelerometerEnabled) return;
    accelerometerEnabled = true;
    sensorInitTime = Date.now();
    sensorInitComplete = false;

    const addListener = () => {
      console.log("Añadiendo event listener deviceorientation");
      window.addEventListener("deviceorientation", handleOrientation, true);
    };

    console.log("DeviceOrientationEvent:", typeof DeviceOrientationEvent);
    console.log("requestPermission:", typeof DeviceOrientationEvent?.requestPermission);
    
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === "granted") addListener();
        })
        .catch(console.error);
    } else {
      addListener();
    }
  }

  function initAccelerometer(gesture) {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation, true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
  }

  function handleOrientation(event) {
    console.log("Orientation:", event.beta, event.gamma);
    if (event.alpha === null || event.alpha === undefined) return;

    if (!sensorInitComplete) {
      if (sensorInitTime === 0) {
        sensorInitTime = Date.now();
      } else if (Date.now() - sensorInitTime < 2000) {
        return;
      }
      sensorInitComplete = true;
    }

    const beta = event.beta || 0;
    const now = Date.now();

    if (isFirstReading) {
      lastBeta = beta;
      isFirstReading = false;
      return;
    }

    let deltaBeta = beta - lastBeta;
    if (Math.abs(deltaBeta) > 180) {
      deltaBeta = deltaBeta > 0 ? deltaBeta - 360 : deltaBeta + 360;
    }
    lastBeta = beta;

    if (Math.abs(deltaBeta) < 15) return;

    const direction = deltaBeta > 0 ? 'down' : 'up';

    if (direction === 'up' && !pumpUpDetected) {
      pumpUpDetected = true;
      tiltIndicator.classList.add("active");
      setTimeout(() => tiltIndicator.classList.remove("active"), 200);
    } else if (direction === 'down' && pumpUpDetected) {
      pumpUpDetected = false;
      movementConsecutiveCount++;
      lastSignificantMotion = now;

      tiltIndicator.classList.add("active");
      setTimeout(() => tiltIndicator.classList.remove("active"), 200);

      if (movementConsecutiveCount >= 1) {
        const energyToSend = boostMultiplier;
        trySendEnergy(energyToSend);

        if (nearThresholdActive) {
          myRepetitions = Math.min(movementConsecutiveCount, 5);
          thresholdCount.textContent = `Repeticiones: ${myRepetitions}/5`;
          if (socket.connected) {
            socket.emit("doGesture", { gesture: "pump" });
          }
        }
      }
    }
  }

  const enableMotionBtn = document.getElementById("enableMotionBtn");
  const motionOverlay = document.getElementById("motionOverlay");

  if (enableMotionBtn) {
    enableMotionBtn.addEventListener("click", function() {
      console.log("Botón tocqueado - intentando inicializar accelerometer");
      initAccelerometerGlobal();
      enableMotionBtn.style.display = "none";
      motionOverlay.style.display = "none";
    });
    enableMotionBtn.addEventListener("touchend", function(e) {
      e.preventDefault();
      console.log("Botón tocqueado touch - intentando inicializar accelerometer");
      initAccelerometerGlobal();
      enableMotionBtn.style.display = "none";
      motionOverlay.style.display = "none";
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") socket.emit("reset");
    if (e.key === "1") {
      if (socket.connected) socket.emit("doGesture", { gesture: "pump" });
    }
    if (e.key === "2") {
      trySendEnergy(50);
    }
  });
})();
