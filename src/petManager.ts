import * as vscode from "vscode";
import { Boy, BoyData } from "./models/Boy";

export class PetManager {
  private context: vscode.ExtensionContext;
  private boy: Boy;
  private updateInterval: NodeJS.Timeout | undefined;

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
    this.boy.addXP(1);
    this.boy.startCoding();
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
      return Boy.fromJSON(savedData);
    }
    return new Boy();
  }

  // Sauvegarde
  public saveBoyData(): void {
    this.context.globalState.update("codingPet.bodData", this.boy.toJSON());
  }

  private startUpdateLoop(): void {
    this.updateInterval = setInterval(() => {
      this.boy.update();
      this.boy.nextFrame();
      this.saveBoyData();
    }, 1000);
  }

  public dispose() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  public getPetStatusText(): string {
    const data = this.boy.getData();
    return `${data.name} | Lvl ${data.level} | ❤️${data.happyness}% | ⚡${data.energy}% | 🍽️${data.hunger}%`;
  }
}
