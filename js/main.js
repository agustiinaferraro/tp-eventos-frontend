(function() {
  const salaParam = new URLSearchParams(window.location.search).get("sala") || "default";
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

  const THRESHOLDS = [0, 50, 500, 1000];

  function getNextThreshold(currentPoints) {
    for (const threshold of THRESHOLDS) {
      if (currentPoints < threshold) return threshold;
    }
    return 1000;
  }

  const socket = io(SERVER_URL, {
    query: { room: salaParam },
    transports: ['websocket', 'polling']
  });

  socket.on("connect", () => {
    connectionStatus.classList.add("connected");
    connectionText.textContent = "CONECTADO";
  });

  socket.on("disconnect", () => {
    connectionStatus.classList.remove("connected");
    connectionText.textContent = "DESCONECTADO";
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
    
    bar.className = colorClass;

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
      let targetColor = '#888';
      if (nextThreshold === 50) targetColor = '#ff6b00';
      else if (nextThreshold === 500) targetColor = '#ffdd00';
      else if (nextThreshold === 1000) targetColor = '#00ff88';
      pumpsToGoEl.innerHTML = `Faltan <span style="color:#fff;font-weight:bold">${remaining}</span> movimientos para llegar a los <span style="color:${targetColor}">${nextThreshold}</span> puntos`;
    }

    if (titleEl && data.room) {
      titleEl.textContent = data.room.toUpperCase();
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
    if (accelerometerEnabled) return;
    accelerometerEnabled = true;
    sensorInitTime = Date.now();
    sensorInitComplete = false;

    const addListener = () => {
      window.addEventListener("deviceorientation", handleOrientation, true);
    };

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
        socket.emit("energy", { energy: energyToSend });

        if (nearThresholdActive) {
          myRepetitions = Math.min(movementConsecutiveCount, 5);
          thresholdCount.textContent = `Repeticiones: ${myRepetitions}/5`;
          socket.emit("doGesture", { gesture: "pump" });
        }
      }
    }
  }

  const enableMotionBtn = document.getElementById("enableMotionBtn");
  const motionOverlay = document.getElementById("motionOverlay");

  if (enableMotionBtn) {
    enableMotionBtn.addEventListener("click", function() {
      initAccelerometerGlobal();
      enableMotionBtn.style.display = "none";
      motionOverlay.style.display = "none";
    });
    enableMotionBtn.addEventListener("touchend", function(e) {
      e.preventDefault();
      initAccelerometerGlobal();
      enableMotionBtn.style.display = "none";
      motionOverlay.style.display = "none";
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") socket.emit("reset");
    if (e.key === "1") socket.emit("doGesture", { gesture: "pump" });
    if (e.key === "2") socket.emit("energy", { energy: 50 });
  });
})();
