import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { PetManager } from "../petManager";

/**
 * Classe responsable de la gestion du contenu webview du pet
 * Sépare la logique de rendu de la gestion du panel
 */
export class PetWebview {
  private readonly extensionUri: vscode.Uri;
  private readonly webview: vscode.Webview;
  private petManager: PetManager;

  constructor(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    petManager: PetManager
  ) {
    this.webview = webview;
    this.extensionUri = extensionUri;
    this.petManager = petManager;
  }

  /**
   * Génère le contenu HTML complet du webview
   */
  public getHtmlContent(): string {
    const petData = this.petManager.getPetData();

    // Lire le template HTML
    const htmlPath = path.join(
      this.extensionUri.fsPath,
      "src",
      "webview",
      "panel.html"
    );

    if (!fs.existsSync(htmlPath)) {
      console.error(`HTML template not found at: ${htmlPath}`);
      return this.getFallbackHtml();
    }

    let htmlContent = fs.readFileSync(htmlPath, "utf8");

    // Créer les URIs sécurisés pour les ressources
    const resourceUris = this.getResourceUris();

    // Configuration JavaScript à injecter
    const configScript = this.generateConfigScript(
      petData,
      resourceUris.spritesUri
    );

    // Remplacer les placeholders
    htmlContent = htmlContent
      .replace("STYLE_URI_PLACEHOLDER", resourceUris.styleUri)
      .replace("SCRIPT_URI_PLACEHOLDER", resourceUris.scriptUri)
      .replace("// Sera remplacé par l'extension", configScript);

    return htmlContent;
  }

  /**
   * Met à jour les données du pet et envoie les changements au webview
   */
  public updatePetData(action?: string): void {
    const petData = this.petManager.getPetData();

    console.log("PetWebview: Updating pet data", {
      action,
      animationState: petData.animationState,
      isCoding: petData.isCoding,
    });

    // Envoyer les nouvelles données
    this.webview.postMessage({
      type: "updatePet",
      data: petData,
    });

    // Envoyer l'action si spécifiée
    if (action) {
      this.webview.postMessage({
        type: "petAction",
        action: action,
      });
    }
  }

  /**
   * Traite les messages reçus du webview
   */
  public handleMessage(message: any): void {
    console.log("PetWebview: Received message", message);

    switch (message.command) {
      case "feedPet":
        this.petManager.feedPet();
        this.updatePetData("feed");
        break;

      case "playWithPet":
        this.petManager.playWithPet();
        this.updatePetData("play");
        break;

      case "letPetRest":
        this.petManager.letPetRest();
        this.updatePetData("rest");
        break;

      case "debug":
        // Commande de debug pour obtenir l'état actuel
        console.log("Debug - Current pet state:", this.petManager.getPetData());
        break;

      default:
        console.warn("Unknown command:", message.command);
    }
  }

  /**
   * Génère les URIs sécurisés pour les ressources
   */
  private getResourceUris() {
    const styleUri = this.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "src", "webview", "panel.css")
    );

    const scriptUri = this.webview.asWebviewUri(
      vscode.Uri.joinPath(this.extensionUri, "src", "webview", "panel.js")
    );

    const spritesUri = this.webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.extensionUri,
        "src",
        "assets",
        "images",
        "sprites",
        "boy"
      )
    );

    return {
      styleUri: styleUri.toString(),
      scriptUri: scriptUri.toString(),
      spritesUri: spritesUri.toString(),
    };
  }

  /**
   * Génère le script de configuration à injecter
   */
  private generateConfigScript(petData: any, spritesUri: string): string {
    return `
    window.PET_CONFIG = {
      petData: ${JSON.stringify(petData, null, 2)},
      spritesUri: '${spritesUri}',
      debug: true
    };
    
    // Logging pour le debug
    console.log('PET_CONFIG loaded:', window.PET_CONFIG);
  `;
  }

  /**
   * HTML de fallback si le template n'est pas trouvé
   */
  private getFallbackHtml(): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Coding Pet</title>
      <style>
        body {
          font-family: var(--vscode-font-family);
          color: var(--vscode-foreground);
          background-color: var(--vscode-editor-background);
          padding: 20px;
          text-align: center;
        }
        .error {
          background: var(--vscode-inputValidation-errorBackground);
          border: 1px solid var(--vscode-inputValidation-errorBorder);
          padding: 10px;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <h1>Coding Pet</h1>
      <div class="error">
        <p>Erreur: Template HTML non trouvé</p>
        <p>Vérifiez que le fichier panel.html existe dans src/webview/</p>
      </div>
    </body>
    </html>`;
  }

  /**
   * Valide que tous les fichiers nécessaires existent
   */
  public validateResources(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Vérifier le HTML
    const htmlPath = path.join(
      this.extensionUri.fsPath,
      "src",
      "webview",
      "panel.html"
    );
    if (!fs.existsSync(htmlPath)) {
      errors.push(`HTML template manquant: ${htmlPath}`);
    }

    // Vérifier le CSS
    const cssPath = path.join(
      this.extensionUri.fsPath,
      "src",
      "webview",
      "panel.css"
    );
    if (!fs.existsSync(cssPath)) {
      errors.push(`CSS manquant: ${cssPath}`);
    }

    // Vérifier le JS
    const jsPath = path.join(
      this.extensionUri.fsPath,
      "src",
      "webview",
      "panel.js"
    );
    if (!fs.existsSync(jsPath)) {
      errors.push(`JavaScript manquant: ${jsPath}`);
    }

    // Vérifier les sprites
    const spritesPath = path.join(
      this.extensionUri.fsPath,
      "src",
      "assets",
      "images",
      "sprites",
      "boy"
    );
    if (!fs.existsSync(spritesPath)) {
      errors.push(`Dossier sprites manquant: ${spritesPath}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
