import * as vscode from 'vscode';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extensión "BryCleansYourCode" activada');

  const disposable = vscode.commands.registerCommand('brycleansyourcode.cleaning', async () => {
    const choice = await vscode.window.showQuickPick(
      [
        { label: 'Eliminar console.log', value: 'logs' },
        { label: 'Eliminar comentarios', value: 'comments' },
        { label: 'Eliminar debugger', value: 'debugger' },
        { label: 'Eliminar todo', value: 'all' }
      ],
      { placeHolder: '¿Qué quieres eliminar?' }
    );
    if (!choice) return;

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('Abre un archivo primero.');
      return;
    }

    const document = editor.document;
    const code = document.getText();
    const langId = document.languageId;

    // Solo actuar sobre JS/TS
    if (!['javascript', 'typescript', 'javascriptreact', 'typescriptreact'].includes(langId)) {
      vscode.window.showWarningMessage('Esta limpieza solo funciona en archivos JavaScript o TypeScript.');
      return;
    }

    let newText = code;

    // --- Eliminar console.*
    if (choice.value === 'logs' || choice.value === 'all') {
      newText = removeConsoleCallsWithFallback(newText);
    }

    // --- Eliminar debugger
    if (choice.value === 'debugger' || choice.value === 'all') {
      newText = removeDebuggerWithFallback(newText);
    }

    // --- Eliminar comentarios simples (// ...) excepto directivas
    if (choice.value === 'comments' || choice.value === 'all') {
      newText = removeSimpleComments(newText);
    }

    // Solo aplicar si hubo cambios
    if (newText !== code) {
      const edit = new vscode.WorkspaceEdit();
      edit.replace(
        document.uri,
        new vscode.Range(document.positionAt(0), document.positionAt(code.length)),
        newText
      );
      await vscode.workspace.applyEdit(edit);
      vscode.window.showInformationMessage(`✅ ${choice.label} completado!`);
    } else {
      vscode.window.showInformationMessage('⚠️ Nada que limpiar.');
    }
  });

  context.subscriptions.push(disposable);
}

// =============== CONSOLE.* ===============

function removeConsoleCallsWithFallback(code: string): string {
  try {
    return removeConsoleCallsAST(code);
  } catch (error) {
    console.warn('⚠️ Falló el parser de Babel. Usando modo de compatibilidad (regex seguro).', error);
    return removeConsoleCallsSafeRegex(code);
  }
}

function removeConsoleCallsAST(code: string): string {
  const ast = parser.parse(code, {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    plugins: [
      'jsx',
      'typescript',
      'classProperties',
      'optionalChaining',
      'nullishCoalescingOperator'
    ]
  });

  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'console' &&
        node.callee.property.type === 'Identifier' &&
        ['log', 'warn', 'error', 'info', 'debug', 'trace'].includes(node.callee.property.name)
      ) {
        if (path.parentPath.isExpressionStatement()) {
          path.remove();
        } else {
          path.replaceWith({ type: 'Identifier', name: 'undefined' });
        }
      }
    }
  });

  return generate(ast, { retainLines: true }).code;
}

function removeConsoleCallsSafeRegex(code: string): string {
  return code
    .split('\n')
    .map(line => {
      // Evitar strings y comentarios
      if (line.match(/['"`].*?\bconsole\./)) return line;
      if (line.trim().startsWith('//')) return line;

      // Línea completa de console.log(...)
      if (/^\s*console\.(log|warn|error|info|debug|trace)\s*\([^)]*\)\s*;?\s*$/.test(line)) {
        return '';
      }

      // En medio de código
      const cleaned = line.replace(
        /\bconsole\.(log|warn|error|info|debug|trace)\s*\([^)]*\)\s*;?/g,
        ''
      );
      return cleaned.trim() === '' || cleaned.trim() === ';' ? '' : cleaned;
    })
    .join('\n');
}

// =============== DEBUGGER ===============

function removeDebuggerWithFallback(code: string): string {
  try {
    return removeDebuggerAST(code);
  } catch (error) {
    console.warn('⚠️ Falló el parser para debugger. Usando regex seguro.', error);
    return removeDebuggerSafeRegex(code);
  }
}

function removeDebuggerAST(code: string): string {
  const ast = parser.parse(code, {
    sourceType: 'module',
    allowImportExportEverywhere: true,
    plugins: ['jsx', 'typescript']
  });

  traverse(ast, {
    DebuggerStatement(path) {
      path.remove();
    }
  });

  return generate(ast, { retainLines: true }).code;
}

function removeDebuggerSafeRegex(code: string): string {
  return code
    .split('\n')
    .map(line => {
      if (line.match(/['"`].*?\bdebugger\b/)) return line;
      if (line.trim().startsWith('//')) return line;

      const cleaned = line.replace(/\bdebugger\s*;?/g, '');
      return cleaned.trim() === '' || cleaned.trim() === ';' ? '' : cleaned;
    })
    .join('\n');
}

// =============== COMENTARIOS ===============

function removeSimpleComments(code: string): string {
  const SAFE_DIRECTIVES = /@(ts-|eslint-|prettier-)|#(region|endregion)|@(preserve|license)/i;
  return code
    .split('\n')
    .map(line => {
      const commentIndex = line.indexOf('//');
      if (commentIndex === -1) return line;
      const before = line.substring(0, commentIndex);
      const comment = line.substring(commentIndex);
      if (SAFE_DIRECTIVES.test(comment)) return line;
      return before;
    })
    .join('\n');
}

export function deactivate() {}