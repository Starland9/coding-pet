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
    // Mise à jour du nom
    const nameElement = document.getElementById("petName");
    if (nameElement) nameElement.textContent = data.name;

    // Mise à jour du niveau
    const levelElement = document.getElementById("levelInfo");
    if (levelElement)
      levelElement.textContent = `Level ${data.level} (XP: ${data.xp})`;

    // Mise à jour des barres de progression
    updateProgressBar("happiness", data.happiness);
    updateProgressBar("energy", data.energy);
    updateProgressBar("hunger", data.hunger);

    // Mise à jour du sprite
    updateSprite(data.animationState, data.currentSprite || "1");
  }

  function updateProgressBar(type, value) {
    const progressElement = document.getElementById(`${type}Progress`);
    const textElement = document.getElementById(`${type}Text`);

    if (progressElement) progressElement.style.width = `${value}%`;
    if (textElement) textElement.textContent = `${value}%`;
  }

  function updateSprite(animationState, currentSprite) {
    const spriteElement = document.getElementById("petSprite");
    if (!spriteElement || !spritesUri) return;

    const spritePath = `${spritesUri}/${animationState}/${currentSprite}.png`;
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
      switch (message.type) {
        case "updatePet":
          currentPetData = message.data;
          updateSprite(
            currentPetData.animationState,
            currentPetData.currentSprite
          );
          updateStats(currentPetData);
          break;
        case "petAction":
          handlePetAction(message.action);
          break;
      }
    });
  }

  function handlePetAction(action) {
    // Effets visuels temporaires basés sur l'action
    const spriteElement = document.getElementById("petSprite");
    if (!spriteElement) return;

    switch (action) {
      case "feed":
        spriteElement.style.transform = "scale(1.1)";
        setTimeout(() => {
          spriteElement.style.transform = "scale(1)";
        }, 300);
        break;
      case "play":
        spriteElement.style.filter = "brightness(1.2)";
        setTimeout(() => {
          spriteElement.style.filter = "brightness(1)";
        }, 500);
        break;
      case "rest":
        spriteElement.style.opacity = "0.5";
        setTimeout(() => {
          spriteElement.style.opacity = "1";
        }, 1000);
        break;
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
