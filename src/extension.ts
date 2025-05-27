import * as vscode from "vscode";
import { PetManager } from "./petManager";
import { PetPanel } from "./webview/petPanel";

let petManager: PetManager;

export function activate(context: vscode.ExtensionContext) {
  console.log("Extension Coding Pet activée!");

  petManager = new PetManager(context);

  // Commande pour ouvrir le panel de l'animal
  const showPetCommand = vscode.commands.registerCommand(
    "codingPet.showPet",
    () => {
      PetPanel.createOrShow(context.extensionUri, petManager);
    }
  );

  // Surveiller les changements de fichiers
  const onDocumentChange = vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.contentChanges.length > 0) {
      petManager.onCodeWritten(event.contentChanges.length);
    }
  });

  // Surveiller les sauvegardes
  const onDocumentSave = vscode.workspace.onDidSaveTextDocument(() => {
    petManager.onFileSaved();
  });

  // Surveiller l'ouverture de fichiers
  const onDocumentOpen = vscode.workspace.onDidOpenTextDocument(() => {
    petManager.onFileOpened();
  });

  // Status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "codingPet.showPet";

  // Mettre à jour le status bar
  const updateStatusBar = () => {
    const pet = petManager.getPetData();
    statusBarItem.text = `$(heart) ${pet.evolution} Niv.${pet.level}`;
    statusBarItem.tooltip = `Santé: ${pet.health}% | Bonheur: ${Math.round(
      pet.happiness
    )}%`;
    statusBarItem.show();
  };

  updateStatusBar();

  // Mettre à jour toutes les 30 secondes
  const interval = setInterval(updateStatusBar, 30000);

  context.subscriptions.push(
    showPetCommand,
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
