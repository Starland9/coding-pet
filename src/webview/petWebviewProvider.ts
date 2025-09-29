import * as vscode from "vscode";
import { PetManager } from "../petManager";
import { PetWebview } from "./petWebview";

/**
 * Provider pour intégrer le pet dans la sidebar de VS Code
 */
export class PetWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "petStatus";

  private _view?: vscode.WebviewView;
  private petWebview?: PetWebview;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly petManager: PetManager
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.extensionUri, "src", "webview"),
        vscode.Uri.joinPath(this.extensionUri, "src", "assets"),
      ],
    };

    // Créer l'instance PetWebview
    this.petWebview = new PetWebview(
      webviewView.webview,
      this.extensionUri,
      this.petManager
    );

    // Valider les ressources
    const validation = this.petWebview.validateResources();
    if (!validation.valid) {
      console.error(
        "PetWebviewProvider: Missing resources:",
        validation.errors
      );
    }

    // Définir le contenu initial
    webviewView.webview.html = this.petWebview.getHtmlContent();

    // Gérer les messages du webview
    webviewView.webview.onDidReceiveMessage((message) => {
      if (this.petWebview) {
        this.petWebview.handleMessage(message);
      }
    });

    // Auto-rafraîchir toutes les 5 secondes
    const refreshInterval = setInterval(() => {
      this.refresh();
    }, 5000);

    // Nettoyer l'intervalle quand la vue est disposée
    webviewView.onDidDispose(() => {
      clearInterval(refreshInterval);
    });

    console.log("PetWebviewProvider: Webview view initialized");
  }

  /**
   * Rafraîchit le contenu de la vue
   */
  public refresh(): void {
    if (this._view && this.petWebview) {
      this.petWebview.updatePetData();
    }
  }

  /**
   * Envoie une mise à jour au webview
   */
  public sendUpdate(action?: string): void {
    if (this.petWebview) {
      this.petWebview.updatePetData(action);
    }
  }

  /**
   * Force le rechargement complet du HTML
   */
  public reload(): void {
    if (this._view && this.petWebview) {
      this._view.webview.html = this.petWebview.getHtmlContent();
    }
  }

  /**
   * Révèle la vue dans la sidebar (la rend visible et focusée)
   */
  public reveal(): void {
    if (this._view) {
      this._view.show?.(true); // true = prendre le focus
    }
  }

  /**
   * Retourne true si la vue est actuellement visible
   */
  public isVisible(): boolean {
    return this._view?.visible ?? false;
  }
}
