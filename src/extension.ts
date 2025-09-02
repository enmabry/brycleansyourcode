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

    if (options.value === 'logs' || options.value === 'all') {
      // Elimina cualquier console.*(...) aunque tenga espacios, saltos o anidación
      cleanedText = cleanedText.replace(/console\.(log|warn|error|info|debug)\s*\([^)]*\)\s*;?/g, '');
    }

    if (options.value === 'comments' || options.value === 'all') {
      // Elimina comentarios de línea (incluso si están al lado de código)
      cleanedText = cleanedText.replace(/\/\/.*$/gm, '');
      // Elimina comentarios de bloque
      cleanedText = cleanedText.replace(/\/\*[\s\S]*?\*\//g, '');
    }

    if (options.value === 'debugger' || options.value === 'all') {
      // Elimina cualquier aparición de 'debugger' (líneas completas o en medio de código)
      cleanedText = cleanedText.replace(/\bdebugger\s*;?/g, '');
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

export function deactivate() { }