export interface BoyData {
  name: string;
  level: number;
  xp: number;
  happyness: number;
  energy: number;
  hunger: number;
  currentSprite: string;
  animationState: "idle" | "happy" | "coding" | "sleeping" | "eating";
  currentFrame: number;
  lastUpdate: number;
}

export class Boy {
  private data: BoyData;

  constructor(data?: Partial<BoyData>) {
    this.data = {
      name: data?.name || "Coding Boy",
      level: data?.level || 1,
      xp: data?.xp || 0,
      happyness: data?.happyness || 50,
      energy: data?.energy || 100,
      hunger: data?.hunger || 50,
      currentSprite: data?.currentSprite || "1",
      animationState: data?.animationState || "idle",
      currentFrame: data?.currentFrame || 0,
      lastUpdate: data?.lastUpdate || Date.now(),
    };
  }

  public getData(): BoyData {
    return this.data;
  }

  public getName(): string {
    return this.data.name;
  }

  public getLevel(): number {
    return this.data.level;
  }

  public getXp(): number {
    return this.data.xp;
  }

  public getHappyness(): number {
    return this.data.happyness;
  }

  public getEnergy(): number {
    return this.data.energy;
  }

  public getHunger(): number {
    return this.data.hunger;
  }

  public getCurrentSprite(): string {
    return this.data.currentSprite;
  }

  public getAnimationState(): string {
    return this.data.animationState;
  }

  public addXP(amount: number): void {
    this.data.xp += amount;
    this.checkLevelUp();
    this.updateAnimationState();
  }

  public feed(): void {
    this.data.hunger = Math.max(100, this.data.hunger + 30);
    this.data.happyness = Math.min(100, this.data.happyness + 10);
    this.setTemporaryState("eating", 3000);
  }

  public play(): void {
    this.data.happyness = Math.min(100, this.data.happyness + 20);
    this.data.energy = Math.max(0, this.data.energy - 10);
    this.setTemporaryState("happy", 3000);
  }

  public rest(): void {
    this.data.energy = Math.min(100, this.data.energy + 40);
    this.setTemporaryState("sleeping", 5000);
  }

  public startCoding(): void {
    this.setTemporaryState("coding", 0);
  }

  public stopCoding(): void {
    this.updateAnimationState();
  }

  public update(): void {
    const now = Date.now();
    const timeDiff = now - this.data.lastUpdate;
    const minutes = timeDiff / (1000 * 60); // Convertir en minutes

    // Dégrader la faim et l'énergie
    this.data.hunger = Math.max(0, this.data.hunger - minutes * 2);
    this.data.energy = Math.max(0, this.data.energy - minutes * 1);

    // Dégrader le bonheur si faim ou énergie basse
    if (this.data.hunger < 20 || this.data.energy < 20) {
      this.data.happyness = Math.max(0, this.data.happyness - minutes * 5);
    }

    this.data.lastUpdate = now;
    this.updateAnimationState();
  }

  private checkLevelUp(): void {
    const xpForNextLevel = this.data.level * 100;
    if (this.data.xp >= xpForNextLevel) {
      this.data.level++;
      this.data.xp -= xpForNextLevel;
      this.data.happyness = Math.min(100, this.data.happyness + 20);
    }
  }

  private updateAnimationState(): void {
    if (this.data.energy < 30) {
      this.data.animationState = "sleeping";
    } else if (this.data.hunger < 20) {
      this.data.animationState = "eating";
    } else if (this.data.happyness > 80) {
      this.data.animationState = "happy";
    } else {
      this.data.animationState = "idle";
    }
  }

  private setTemporaryState(
    state: BoyData["animationState"],
    duration: number
  ): void {
    const previousState = this.data.animationState;
    this.data.animationState = state;

    if (duration > 0) {
      setTimeout(() => {
        if (this.data.animationState === state) {
          this.updateAnimationState();
        }
      }, duration);
    }
  }

  public getFramesForState(): string[] {
    const frameMap = {
      idle: ["1", "2", "3", "4"],
      happy: ["1", "2"],
      sleeping: ["1", "2", "3", "4"],
      eating: ["1", "2", "3", "4"],
      coding: ["1", "2", "3", "4"],
    };
    return frameMap[this.data.animationState] || ["1"];
  }

  public nextFrame(): void {
    const frames = this.getFramesForState();
    this.data.currentFrame = (this.data.currentFrame + 1) % frames.length;
    this.data.currentSprite = frames[this.data.currentFrame];
  }

  public toJSON(): BoyData {
    return this.data;
  }

  public static fromJSON(json: BoyData): Boy {
    const boy = new Boy();
    boy.data = json;
    return boy;
  }
}
