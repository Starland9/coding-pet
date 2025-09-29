import * as vscode from "vscode";
import { PetManager } from "./petManager";
import { PetPanel } from "./webview/petPanel";
import { PetWebviewProvider } from "./webview/petWebviewProvider";

let petManager: PetManager;
let petWebviewProvider: PetWebviewProvider;

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension Coding Pet activée!");

  petManager = new PetManager(context);

  // Créer et enregistrer le provider pour la sidebar
  petWebviewProvider = new PetWebviewProvider(context.extensionUri, petManager);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      PetWebviewProvider.viewType,
      petWebviewProvider
    )
  );

  // Commande pour révéler le pet dans la sidebar
  const showPetCommand = vscode.commands.registerCommand(
    "codingPet.showPet",
    () => {
      // Révéler le view container dans la sidebar puis la vue spécifique
      vscode.commands.executeCommand("workbench.view.extension.codingPet");
    }
  );

  // Commande pour nourrir le pet
  const feedPetCommand = vscode.commands.registerCommand(
    "codingPet.feedPet",
    () => {
      petManager.feedPet();
      petWebviewProvider.sendUpdate("feed");
    }
  );

  // Surveiller les changements de fichiers
  const onDocumentChange = vscode.workspace.onDidChangeTextDocument((event) => {
    // Filtrer les fichiers de code seulement
    if (
      event.document.uri.scheme === "file" &&
      event.contentChanges.length > 0 &&
      !event.document.fileName.includes(".git/") &&
      !event.document.fileName.includes("node_modules/")
    ) {
      console.log("Extension: Code change in:", event.document.fileName);
      petManager.onCodeChange();

      // Mettre à jour la vue sidebar
      petWebviewProvider.sendUpdate("coding");
    }
  });

  // Surveiller les sauvegardes
  const onDocumentSave = vscode.workspace.onDidSaveTextDocument((document) => {
    if (document.uri.scheme === "file") {
      console.log("Extension: File saved:", document.fileName);
      petManager.onFileChange();

      // Mettre à jour la vue sidebar
      petWebviewProvider.sendUpdate("save");
    }
  });

  // Surveiller l'ouverture de fichiers
  const onDocumentOpen = vscode.workspace.onDidOpenTextDocument(() => {
    petManager.onFileOpen();
  });

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "codingPet.showPet";

  // Mettre à jour le status bar
  const updateStatusBar = () => {
    statusBarItem.text = petManager.getPetStatusText();

    statusBarItem.show();
  };

  updateStatusBar();

  // Mettre à jour toutes les 30 secondes
  const interval = setInterval(updateStatusBar, 30000);

  context.subscriptions.push(
    showPetCommand,
    feedPetCommand,
    onDocumentChange,
    onDocumentSave,
    onDocumentOpen,
    statusBarItem,
    { dispose: () => clearInterval(interval) }
  );
}

export function deactivate() {
  if (petManager) {
    petManager.dispose();
  }
}
