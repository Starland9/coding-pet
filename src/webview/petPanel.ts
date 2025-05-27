import * as vscode from "vscode";
import { PetManager } from "../petManager";

export class PetPanel {
  public static currentPanel: PetPanel | undefined;
  public static readonly viewType = "petPanel";

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionUri: vscode.Uri, petManager: PetManager) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    if (PetPanel.currentPanel) {
      PetPanel.currentPanel.panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      PetPanel.viewType,
      "Mon Animal de Compagnie",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.joinPath(extensionUri, "media")],
      }
    );

    PetPanel.currentPanel = new PetPanel(panel, extensionUri, petManager);
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    private petManager: PetManager
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;

    this.update();

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    this.panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "feedPet":
            this.petManager.feedPet();
            this.update();
            return;
          case "fixBug":
            this.petManager.onBugFixed();
            this.update();
            return;
        }
      },
      null,
      this.disposables
    );

    // Écouter les mises à jour du pet
    this.petManager.onPetUpdate(() => {
      this.update();
    });
  }

  private update() {
    const petData = this.petManager.getPetData();
    this.panel.webview.html = this.getHtmlForWebview(petData);
  }

  private getHtmlForWebview(petData: any) {
    // Utiliser le code React/HTML de l'artifact précédent
    // mais adapté pour VS Code webview
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mon Animal de Compagnie</title>
            <style>
                body { 
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                    padding: 20px;
                    margin: 0;
                }
                .pet-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: var(--vscode-editor-background);
                    padding: 20px;
                    border-radius: 8px;
                }
                .pet-display {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .pet-emoji {
                    font-size: 60px;
                    margin-bottom: 10px;
                }
                .stat-bar {
                    background: var(--vscode-input-background);
                    height: 20px;
                    border-radius: 10px;
                    overflow: hidden;
                    margin: 5px 0;
                }
                .stat-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                }
                .health { background-color: #ff6b6b; }
                .energy { background-color: #ffd93d; }
                .happiness { background-color: #6bcf7f; }
                .actions {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                    margin-top: 20px;
                }
                button {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                }
                button:hover {
                    background: var(--vscode-button-hoverBackground);
                }
            </style>
        </head>
        <body>
            <div class="pet-container">
                <div class="pet-display">
                    <div class="pet-emoji">${this.getEmojiForEvolution(
                      petData.evolution
                    )}</div>
                    <h2>${petData.name} - Niveau ${petData.level}</h2>
                    <p>Évolution: ${petData.evolution} | Humeur: ${
      petData.mood
    }</p>
                </div>
                
                <div class="stats">
                    <div>
                        <label>Santé: ${petData.health}%</label>
                        <div class="stat-bar">
                            <div class="stat-fill health" style="width: ${
                              petData.health
                            }%"></div>
                        </div>
                    </div>
                    
                    <div>
                        <label>Énergie: ${petData.energy}%</label>
                        <div class="stat-bar">
                            <div class="stat-fill energy" style="width: ${
                              petData.energy
                            }%"></div>
                        </div>
                    </div>
                    
                    <div>
                        <label>Bonheur: ${Math.round(
                          petData.happiness
                        )}%</label>
                        <div class="stat-bar">
                            <div class="stat-fill happiness" style="width: ${
                              petData.happiness
                            }%"></div>
                        </div>
                    </div>
                </div>

                <div class="stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                    <div>
                        <h3>Statistiques</h3>
                        <p>Lignes de code: ${petData.stats.linesOfCode}</p>
                        <p>Bugs corrigés: ${petData.stats.bugsFixed}</p>
                        <p>Fichiers sauvés: ${petData.stats.filesSaved}</p>
                        <p>XP Total: ${petData.xp}</p>
                    </div>
                </div>

                <div class="actions">
                    <button onclick="sendMessage('feedPet')">🍖 Nourrir</button>
                    <button onclick="sendMessage('fixBug')">🐛 Corriger un Bug</button>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                
                function sendMessage(command) {
                    vscode.postMessage({ command: command });
                }
            </script>
        </body>
        </html>`;
  }

  private getEmojiForEvolution(evolution: string): string {
    const emojis: { [key: string]: string } = {
      chaton: "🐱",
      chat: "😺",
      lynx: "🐱‍💻",
      tigre: "🐅",
      dragon: "🐲",
    };
    return emojis[evolution] || "🐱";
  }

  public dispose() {
    PetPanel.currentPanel = undefined;
    this.panel.dispose();
    while (this.disposables.length) {
      const disposable = this.disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
