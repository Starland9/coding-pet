(function () {
  "use strict";

  const vscode = acquireVsCodeApi();
  let currentPetData = window.PET_CONFIG ? window.PET_CONFIG.petData : null;
  const spritesUri = window.PET_CONFIG ? window.PET_CONFIG.spritesUri : "";

  // Initialisation
  function init() {
    if (currentPetData) {
      updateUI(currentPetData);
    }
    setupEventListeners();
    startAnimationLoop();
  }

  function updateUI(data) {
    // Mise à jour du titre avec le nom
    const titleElement = document.querySelector(".title-text");
    if (titleElement)
      titleElement.textContent = data.name || "Coding Companion";

    // Mise à jour du status
    updateStatus(data);

    // Mise à jour du niveau et XP
    updateLevelDisplay(data);

    // Mise à jour des barres de progression
    updateProgressBar("happiness", data.happiness);
    updateProgressBar("energy", data.energy);
    updateProgressBar("hunger", data.hunger);

    // Mise à jour du sprite
    updateSprite(data.animationState, data.currentSprite || "1");
  }

  function updateStatus(data) {
    const statusText = document.getElementById("statusText");
    const statusDot = document.querySelector(".status-dot");

    if (!statusText || !statusDot) return;

    let status = "Active";
    let color = "#4ade80";

    if (data.animationState === "coding") {
      status = "Coding";
      color = "#667eea";
    } else if (data.animationState === "sleeping") {
      status = "Resting";
      color = "#fbbf24";
    } else if (data.animationState === "eating") {
      status = "Eating";
      color = "#f59e0b";
    } else if (data.animationState === "happy") {
      status = "Happy";
      color = "#ec4899";
    }

    statusText.textContent = status;
    statusDot.style.background = color;
  }

  function updateLevelDisplay(data) {
    // Mise à jour du numéro de niveau
    const levelNumber = document.getElementById("levelNumber");
    if (levelNumber) levelNumber.textContent = data.level;

    // Mise à jour du texte XP
    const xpText = document.getElementById("xpText");
    if (xpText) {
      const nextLevelXP = data.level * 100;
      xpText.textContent = `${data.xp}/${nextLevelXP} XP`;
    }

    // Mise à jour de la barre de progression XP
    const xpProgress = document.getElementById("xpProgress");
    if (xpProgress) {
      const nextLevelXP = data.level * 100;
      const percentage = (data.xp / nextLevelXP) * 100;
      xpProgress.style.width = `${percentage}%`;
    }

    // Mise à jour du cercle de progression du niveau
    const levelCircle = document.getElementById("levelCircle");
    if (levelCircle) {
      const circumference = 2 * Math.PI * 25; // rayon de 25
      const nextLevelXP = data.level * 100;
      const percentage = (data.xp / nextLevelXP) * 100;
      const offset = circumference - (percentage / 100) * circumference;
      levelCircle.style.strokeDashoffset = offset;
    }
  }

  function updateProgressBar(type, value) {
    const progressElement = document.getElementById(`${type}Progress`);
    const textElement = document.getElementById(`${type}Text`);

    if (progressElement) progressElement.style.width = `${value}%`;
    if (textElement) textElement.textContent = `${value}%`;
  }

  function updateSprite(animationState, currentSprite) {
    console.log("JS: Updating sprite", {
      animationState,
      currentSprite,
      spritesUri,
    });

    const spriteElement = document.getElementById("petSprite");
    if (!spriteElement || !spritesUri) {
      console.log("JS: Missing sprite element or sprites URI");
      return;
    }

    const spritePath = `${spritesUri}/${animationState}/${currentSprite}.png`;
    console.log("JS: Setting sprite path:", spritePath);

    spriteElement.style.backgroundImage = `url('${spritePath}')`;
    spriteElement.className = `sprite ${animationState}`;
  }

  function updateStats(data) {
    // Mise à jour des barres de progression
    const progressBars = document.querySelectorAll(".progress");
    if (progressBars[0]) progressBars[0].style.width = `${data.happiness}%`;
    if (progressBars[1]) progressBars[1].style.width = `${data.energy}%`;
    if (progressBars[2]) progressBars[2].style.width = `${data.hunger}%`;

    // Mise à jour des textes
    const statSpans = document.querySelectorAll(".stat-bar span:last-child");
    if (statSpans[1]) statSpans[1].textContent = `${data.happiness}%`;
    if (statSpans[2]) statSpans[2].textContent = `${data.energy}%`;
    if (statSpans[3]) statSpans[3].textContent = `${data.hunger}%`;

    // Mise à jour du niveau
    const levelSpan = document.querySelector(".stat-bar span:first-child");
    if (levelSpan) {
      levelSpan.textContent = `Level ${data.level} (XP: ${data.xp})`;
    }
  }

  function setupEventListeners() {
    // Écouter les messages de l'extension
    window.addEventListener("message", (event) => {
      const message = event.data;
      console.log("JS: Received message", message);

      switch (message.type) {
        case "updatePet":
          console.log("JS: Updating pet data", message.data);
          currentPetData = message.data;
          updateSprite(
            currentPetData.animationState,
            currentPetData.currentSprite
          );
          updateStats(currentPetData);
          break;
        case "petAction":
          console.log("JS: Pet action", message.action);
          handlePetAction(message.action);
          break;
      }
    });
  }

  function handlePetAction(action) {
    // Effets visuels avancés basés sur l'action
    triggerInteractionRipple();
    createActionParticles(action);
    animateActionButton(action);
  }

  function triggerInteractionRipple() {
    const ripple = document.getElementById("interactionRipple");
    if (ripple) {
      ripple.style.opacity = "1";
      ripple.style.transform = "scale(1)";

      setTimeout(() => {
        ripple.style.opacity = "0";
        ripple.style.transform = "scale(0.8)";
      }, 600);
    }
  }

  function createActionParticles(action) {
    const container = document.querySelector(".sprite-container");
    if (!container) return;

    const colors = {
      feed: ["#fa709a", "#fee140"],
      play: ["#4facfe", "#00f2fe"],
      rest: ["#43e97b", "#38f9d7"],
    };

    const actionColors = colors[action] || colors.feed;

    for (let i = 0; i < 6; i++) {
      createParticle(container, actionColors[i % 2]);
    }
  }

  function createParticle(container, color) {
    const particle = document.createElement("div");
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 100;
    `;

    const rect = container.getBoundingClientRect();
    const startX = rect.width / 2;
    const startY = rect.height / 2;

    particle.style.left = startX + "px";
    particle.style.top = startY + "px";

    container.appendChild(particle);

    // Animation de la particule
    const angle = Math.random() * Math.PI * 2;
    const velocity = 20 + Math.random() * 30;
    const endX = startX + Math.cos(angle) * velocity;
    const endY = startY + Math.sin(angle) * velocity;

    particle.animate(
      [
        {
          transform: `translate(0, 0) scale(1)`,
          opacity: 1,
        },
        {
          transform: `translate(${endX - startX}px, ${
            endY - startY
          }px) scale(0)`,
          opacity: 0,
        },
      ],
      {
        duration: 800,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      }
    ).onfinish = () => {
      particle.remove();
    };
  }

  function animateActionButton(action) {
    const buttons = {
      feed: document.querySelector(".action-btn.feed"),
      play: document.querySelector(".action-btn.play"),
      rest: document.querySelector(".action-btn.rest"),
    };

    const button = buttons[action];
    if (button) {
      const ripple = button.querySelector(".btn-ripple");
      if (ripple) {
        ripple.style.opacity = "1";
        ripple.style.transform = "scale(1)";

        setTimeout(() => {
          ripple.style.opacity = "0";
          ripple.style.transform = "scale(0)";
        }, 400);
      }
    }
  }

  function startAnimationLoop() {
    // Animation automatique des frames
    setInterval(() => {
      if (currentPetData && currentPetData.animationState !== "sleeping") {
        // La logique de changement de frame est gérée côté extension
        // Ici on peut juste ajouter des effets visuels supplémentaires
      }
    }, 800);
  }

  // Actions utilisateur
  window.feedPet = function () {
    vscode.postMessage({ command: "feedPet" });
  };

  window.playWithPet = function () {
    vscode.postMessage({ command: "playWithPet" });
  };

  window.letPetRest = function () {
    vscode.postMessage({ command: "letPetRest" });
  };

  // Initialiser quand le DOM est chargé
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
