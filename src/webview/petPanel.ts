import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
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
      PetPanel.currentPanel.update();
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      PetPanel.viewType,
      "Mon Animal de Compagnie",
      column || vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "src", "webview"),
          vscode.Uri.joinPath(extensionUri, "src", "assets"),
        ],
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
            this.sendUpdateToPet("feed");
            break;
          case "playWithPet":
            this.petManager.playWithPet();
            this.sendUpdateToPet("play");
            break;
          case "letPetRest":
            this.petManager.letPetRest();
            this.sendUpdateToPet("rest");
            break;
        }
      },
      null,
      this.disposables
    );
  }

  private update() {
    this.panel.webview.html = this.getWebviewContent();
  }

  private sendUpdateToPet(action?: string) {
    const petData = this.petManager.getPetData();
    this.panel.webview.postMessage({
      type: "updatePet",
      data: petData,
    });

    if (action) {
      this.panel.webview.postMessage({
        type: "petAction",
        action: action,
      });
    }
  }

  private getWebviewContent(): string {
    const petData = this.petManager.getPetData();

    // Lire le template HTML
    const htmlPath = path.join(
      this.extensionUri.fsPath,
      "src",
      "webview",
      "panel.html"
    );
    let htmlContent = fs.readFileSync(htmlPath, "utf8");

    // Créer les URIs pour les ressources
    const styleUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "src", "webview", "panel.css")
    );
    const scriptUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "src", "webview", "panel.js")
    );
    const spritesUri = this.panel.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        "src",
        "assets",
        "images",
        "sprites",
        "boy"
      )
    );

    // Configuration JavaScript à injecter
    const configScript = `
    window.PET_CONFIG = {
      petData: ${JSON.stringify(petData)},
      spritesUri: '${spritesUri.toString()}'
    };
  `;

    // Remplacer les placeholders
    htmlContent = htmlContent
      .replace("STYLE_URI_PLACEHOLDER", styleUri.toString())
      .replace("SCRIPT_URI_PLACEHOLDER", scriptUri.toString())
      .replace("// Sera remplacé par l'extension", configScript);

    return htmlContent;
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
