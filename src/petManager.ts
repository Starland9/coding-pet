import * as vscode from "vscode";
import { Boy, BoyData } from "./models/Boy";

export class PetManager {
  private context: vscode.ExtensionContext;
  private boy: Boy;
  private updateInterval: NodeJS.Timeout | undefined;
  private codingTimeout: NodeJS.Timeout | undefined;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.boy = this.loadBoyData();
    this.startUpdateLoop();
  }

  public getPetData() {
    return this.boy.getData();
  }

  public getBoy(): Boy {
    return this.boy;
  }

  public feedPet(): void {
    this.boy.feed();
    this.saveBoyData();
  }

  public playWithPet(): void {
    this.boy.play();
    this.saveBoyData();
  }

  public letPetRest(): void {
    this.boy.rest();
    this.saveBoyData();
  }

  public onCodeChange(): void {
    console.log("PetManager: Code change detected");
    this.boy.addXP(1);
    this.boy.startCoding();
    this.resetCodingTimeout();
    this.saveBoyData();
  }

  public onFileChange(): void {
    this.boy.addXP(5);
    this.saveBoyData();
  }

  public onFileOpen(): void {
    this.boy.addXP(2);
    this.saveBoyData();
  }

  // Persistance
  private loadBoyData(): Boy {
    const savedData =
      this.context.globalState.get<BoyData>("codingPet.boyData");
    if (savedData) {
      // Migration automatique : arrondir les anciennes données avec décimales
      const migratedData = this.migrateLegacyData(savedData);
      const boy = Boy.fromJSON(migratedData);
      // Sauvegarder immédiatement les données migrées
      this.context.globalState.update("codingPet.boyData", boy.toJSON());
      return boy;
    }
    return new Boy();
  }

  /**
   * Migration des anciennes données avec décimales vers entiers
   */
  private migrateLegacyData(data: BoyData): BoyData {
    return {
      ...data,
      happiness: Math.round(data.happiness),
      energy: Math.round(data.energy),
      hunger: Math.round(data.hunger),
      // S'assurer que les autres valeurs numériques sont aussi propres
      level: Math.round(data.level),
      xp: Math.round(data.xp),
    };
  }

  // Sauvegarde
  public saveBoyData(): void {
    this.context.globalState.update("codingPet.boyData", this.boy.toJSON());
  }

  private startUpdateLoop(): void {
    this.updateInterval = setInterval(() => {
      this.boy.update();
      this.boy.nextFrame();
      this.saveBoyData();
    }, 1000);
  }

  private resetCodingTimeout(): void {
    if (this.codingTimeout) {
      clearTimeout(this.codingTimeout);
    }

    this.codingTimeout = setTimeout(() => {
      console.log("PetManager: Coding timeout - stopping coding mode");
      this.boy.stopCoding();
      this.saveBoyData();
    }, 10000); // 10 secondes sans changement = arrêt du mode coding
  }

  public dispose() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.codingTimeout) {
      clearTimeout(this.codingTimeout);
    }
  }

  public getPetStatusText(): string {
    const data = this.boy.getData();
    return `${data.name} | Lvl ${data.level} | ❤️${Math.round(
      data.happiness
    )}% | ⚡${Math.round(data.energy)}% | 🍽️${Math.round(data.hunger)}%`;
  }
}
