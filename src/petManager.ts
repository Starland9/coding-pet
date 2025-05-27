import * as vscode from "vscode";

export interface PetData {
  name: string;
  level: number;
  xp: number;
  health: number;
  happiness: number;
  energy: number;
  mood: string;
  evolution: string;
  stats: {
    linesOfCode: number;
    bugsFixed: number;
    filesSaved: number;
    sessionsCount: number;
    lastActive: number;
  };
}

export class PetManager {
  private context: vscode.ExtensionContext;
  private petData: PetData;
  private onPetUpdateEmitter = new vscode.EventEmitter<PetData>();
  public readonly onPetUpdate = this.onPetUpdateEmitter.event;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.petData = this.loadPetData();

    // Dégrader progressivement les stats
    setInterval(() => {
      this.degradeStats();
    }, 60000); // Chaque minute
  }

  private loadPetData(): PetData {
    const saved = this.context.globalState.get<PetData>("petData");
    if (saved) {
      return saved;
    }

    return {
      name: "CodeCat",
      level: 1,
      xp: 0,
      health: 100,
      happiness: 80,
      energy: 90,
      mood: "content",
      evolution: "chaton",
      stats: {
        linesOfCode: 0,
        bugsFixed: 0,
        filesSaved: 0,
        sessionsCount: 1,
        lastActive: Date.now(),
      },
    };
  }

  private savePetData() {
    this.context.globalState.update("petData", this.petData);
    this.onPetUpdateEmitter.fire(this.petData);
  }

  public onCodeWritten(changes: number) {
    this.petData.stats.linesOfCode += changes;
    this.addXP(changes * 2);
    this.petData.happiness = Math.min(100, this.petData.happiness + 1);
    this.petData.stats.lastActive = Date.now();
    this.updateEvolution();
    this.savePetData();
  }

  public onFileSaved() {
    this.petData.stats.filesSaved++;
    this.addXP(10);
    this.petData.happiness = Math.min(100, this.petData.happiness + 5);
    this.savePetData();
  }

  public onFileOpened() {
    this.petData.energy = Math.max(0, this.petData.energy - 1);
    this.savePetData();
  }

  public onBugFixed() {
    this.petData.stats.bugsFixed++;
    this.addXP(15);
    this.petData.happiness = Math.max(0, this.petData.happiness - 2);
    this.savePetData();
  }

  private addXP(amount: number) {
    this.petData.xp += amount;
    const newLevel = Math.floor(this.petData.xp / 100) + 1;

    if (newLevel > this.petData.level) {
      this.petData.level = newLevel;
      this.petData.health = Math.min(100, this.petData.health + 20);
      vscode.window.showInformationMessage(
        `🎉 Votre animal a atteint le niveau ${newLevel}!`
      );
    }
  }

  private updateEvolution() {
    const evolutions = {
      chaton: { minLevel: 1 },
      chat: { minLevel: 5 },
      lynx: { minLevel: 10 },
      tigre: { minLevel: 15 },
      dragon: { minLevel: 20 },
    };

    for (const [evolution, data] of Object.entries(evolutions).reverse()) {
      if (this.petData.level >= data.minLevel) {
        if (this.petData.evolution !== evolution) {
          this.petData.evolution = evolution;
          vscode.window.showInformationMessage(
            `🔥 Votre animal a évolué en ${evolution}!`
          );
        }
        break;
      }
    }
  }

  private degradeStats() {
    const now = Date.now();
    const timeSinceActive = now - this.petData.stats.lastActive;

    // Si inactif depuis plus de 30 minutes
    if (timeSinceActive > 30 * 60 * 1000) {
      this.petData.happiness = Math.max(0, this.petData.happiness - 2);
      this.petData.energy = Math.max(0, this.petData.energy - 1);
    }

    // Mise à jour de l'humeur
    if (this.petData.energy < 30) {
      this.petData.mood = "fatigué";
    } else if (this.petData.happiness > 90) {
      this.petData.mood = "euphorique";
    } else if (this.petData.happiness < 40) {
      this.petData.mood = "frustré";
    } else {
      this.petData.mood = "content";
    }

    this.savePetData();
  }

  public getPetData(): PetData {
    return { ...this.petData };
  }

  public feedPet() {
    this.petData.happiness = Math.min(100, this.petData.happiness + 20);
    this.petData.energy = Math.min(100, this.petData.energy + 15);
    this.savePetData();
  }

  public dispose() {
    this.onPetUpdateEmitter.dispose();
  }
}
