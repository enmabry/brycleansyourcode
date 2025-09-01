import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extensión "BryCleansYourCode" activada');

  // Registrar el comando
  const disposable = vscode.commands.registerCommand('brycleansyourcode.cleaning', async () => {
    // Mostrar opciones al usuario
    const options = await vscode.window.showQuickPick(
      [
        { label: '🗑️ Eliminar console.log', value: 'logs' },
        { label: '💬 Eliminar comentarios', value: 'comments' },
        { label: '🐞 Eliminar debugger', value: 'debugger' },
        { label: '🧹 Eliminar todo', value: 'all' }
      ],
      { placeHolder: '¿Qué quieres eliminar?' }
    );

    if (!options) return; // Si cancela

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Abre un archivo primero.');
      return;
    }

    const document = editor.document;
    const text = document.getText();

    let cleanedText = text;

    // Regex mejorados para mayor precisión
    if (options.value === 'logs' || options.value === 'all') {
      // Elimina líneas completas con console.log, console.warn, etc. (soporta espacios y paréntesis anidados simples)
      cleanedText = cleanedText.replace(/^[ \t]*console\.(log|warn|error|info|debug)\s*\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)\s*;?\s*$/gm, '');
    }

    if (options.value === 'comments' || options.value === 'all') {
      // Elimina comentarios de línea completos
      cleanedText = cleanedText.replace(/^[ \t]*\/\/.*$/gm, '');
      // Elimina comentarios de bloque completos (en líneas completas)
      cleanedText = cleanedText.replace(/^[ \t]*\/\*[\s\S]*?\*\/[ \t]*$/gm, '');
    }

    if (options.value === 'debugger' || options.value === 'all') {
      // Elimina líneas completas con debugger
      cleanedText = cleanedText.replace(/^[ \t]*debugger;?[ \t]*$/gm, '');
    }

    // Elimina líneas en blanco sobrantes
    cleanedText = cleanedText.replace(/\n{3,}/g, '\n\n');
    cleanedText = cleanedText.replace(/^[ \t]*\n/gm, '');

    // Reemplazar en el editor
    const entireRange = new vscode.Range(
      document.positionAt(0),
      document.positionAt(text.length)
    );

    editor.edit(editBuilder => {
      editBuilder.replace(entireRange, cleanedText);
    });

    vscode.window.showInformationMessage(`✅ ${options.label} completado!`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}