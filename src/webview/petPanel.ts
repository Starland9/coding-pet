import * as vscode from "vscode";
import { PetManager } from "../petManager";
import { PetWebview } from "./petWebview";

export class PetPanel {
  public static currentPanel: PetPanel | undefined;
  public static readonly viewType = "petPanel";

  private readonly panel: vscode.WebviewPanel;
  private readonly extensionUri: vscode.Uri;
  private readonly petWebview: PetWebview;
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

    // Initialiser le webview
    this.petWebview = new PetWebview(
      this.panel.webview,
      extensionUri,
      petManager
    );

    // Valider les ressources au démarrage
    const validation = this.petWebview.validateResources();
    if (!validation.valid) {
      console.error("PetPanel: Missing resources:", validation.errors);
    }

    this.update();

    this.panel.onDidDispose(() => this.dispose(), null, this.disposables);

    // Déléguer les messages au PetWebview
    this.panel.webview.onDidReceiveMessage(
      (message) => this.petWebview.handleMessage(message),
      null,
      this.disposables
    );
  }

  private update() {
    this.panel.webview.html = this.petWebview.getHtmlContent();
  }

  public sendUpdateToPet(action?: string) {
    this.petWebview.updatePetData(action);
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
