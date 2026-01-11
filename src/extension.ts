import * as vscode from "vscode";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

export function activate(context: vscode.ExtensionContext) {
  console.log('Extensión "BryCleansYourCode" activada');

  const disposable = vscode.commands.registerCommand(
    "codecleaner.cleaning",
    async () => {
      const choice = await vscode.window.showQuickPick(
        [
          { label: "Eliminar console.log", value: "logs" },
          { label: "Eliminar comentarios", value: "comments" },
          { label: "Eliminar debugger", value: "debugger" },
          { label: "Eliminar emojis", value: "emojis" },
          { label: "Eliminar todo", value: "all" },
        ],
        { placeHolder: "¿Qué quieres eliminar?" }
      );
      if (!choice) return;

      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage("Abre un archivo primero.");
        return;
      }

      const document = editor.document;
      const langId = document.languageId;
      const selection = editor.selection;

      // 2. Verificamos si es una selección vacía
      const isSelectionEmpty = selection.isEmpty;

      // Si está vacía, cogemos TODO el texto. Si no, cogemos SOLO lo seleccionado.
      const code = isSelectionEmpty
        ? document.getText()
        : document.getText(selection);

      // Solo actuar sobre JS/TS
      if (
        ![
          "javascript",
          "typescript",
          "javascriptreact",
          "typescriptreact",
        ].includes(langId)
      ) {
        vscode.window.showWarningMessage(
          "Esta limpieza solo funciona en archivos JavaScript o TypeScript."
        );
        return;
      }

      let newText = code;

      // --- Eliminar console.*
      if (choice.value === "logs" || choice.value === "all") {
        newText = removeConsoleCallsWithFallback(newText);
      }

      // --- Eliminar debugger
      if (choice.value === "debugger" || choice.value === "all") {
        newText = removeDebuggerWithFallback(newText);
      }

      // --- Eliminar comentarios simples (// ...) excepto directivas
      if (choice.value === "comments" || choice.value === "all") {
        newText = removeSimpleComments(newText);
      }

      if (choice.value === "emojis" || choice.value === "all") {
        newText = removeEmojis(newText);
      }

      // Solo aplicar si hubo cambios
      if (newText !== code) {
        const edit = new vscode.WorkspaceEdit();

        // 3. Calculamos DÓNDE vamos a pegar el texto limpio
        let rangeToReplace;

        if (isSelectionEmpty) {
          // Si era todo el archivo, creamos un rango desde el principio (0) hasta el final
          const lastLine = document.lineCount - 1;
          const lastChar = document.lineAt(lastLine).text.length;
          rangeToReplace = new vscode.Range(0, 0, lastLine, lastChar);
        } else {
          // Si era una selección, usamos exactamente el mismo rango que seleccionó el usuario
          rangeToReplace = selection;
        }

        // Reemplazamos en el rango calculado
        edit.replace(document.uri, rangeToReplace, newText);

        await vscode.workspace.applyEdit(edit);
        vscode.window.showInformationMessage(`✅ ${choice.label} completado!`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

// =============== CONSOLE.* ===============

function removeConsoleCallsWithFallback(code: string): string {
  try {
    return removeConsoleCallsAST(code);
  } catch (error) {
    console.warn(
      "⚠️ Falló el parser de Babel. Usando modo de compatibilidad (regex seguro).",
      error
    );
    return removeConsoleCallsSafeRegex(code);
  }
}

function removeConsoleCallsAST(code: string): string {
  const ast = parser.parse(code, {
    sourceType: "module",
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    plugins: [
      "jsx",
      "typescript",
      "classProperties",
      "optionalChaining",
      "nullishCoalescingOperator",
    ],
  });

  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      if (
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "console" &&
        node.callee.property.type === "Identifier" &&
        ["log", "warn", "error", "info", "debug", "trace"].includes(
          node.callee.property.name
        )
      ) {
        if (path.parentPath.isExpressionStatement()) {
          path.remove();
        } else {
          path.replaceWith({ type: "Identifier", name: "undefined" });
        }
      }
    },
  });

  return generate(ast, { retainLines: true }).code;
}

function removeConsoleCallsSafeRegex(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      // Evitar strings y comentarios
      if (line.match(/['"`].*?\bconsole\./)) return line;
      if (line.trim().startsWith("//")) return line;

      // Línea completa de console.log(...)
      if (
        /^\s*console\.(log|warn|error|info|debug|trace)\s*\([^)]*\)\s*;?\s*$/.test(
          line
        )
      ) {
        return "";
      }

      // En medio de código
      const cleaned = line.replace(
        /\bconsole\.(log|warn|error|info|debug|trace)\s*\([^)]*\)\s*;?/g,
        ""
      );
      return cleaned.trim() === "" || cleaned.trim() === ";" ? "" : cleaned;
    })
    .join("\n");
}

// =============== DEBUGGER ===============

function removeDebuggerWithFallback(code: string): string {
  try {
    return removeDebuggerAST(code);
  } catch (error) {
    console.warn(
      "⚠️ Falló el parser para debugger. Usando regex seguro.",
      error
    );
    return removeDebuggerSafeRegex(code);
  }
}

function removeDebuggerAST(code: string): string {
  const ast = parser.parse(code, {
    sourceType: "module",
    allowImportExportEverywhere: true,
    plugins: ["jsx", "typescript"],
  });

  traverse(ast, {
    DebuggerStatement(path) {
      path.remove();
    },
  });

  return generate(ast, { retainLines: true }).code;
}

function removeDebuggerSafeRegex(code: string): string {
  return code
    .split("\n")
    .map((line) => {
      if (line.match(/['"`].*?\bdebugger\b/)) return line;
      if (line.trim().startsWith("//")) return line;

      const cleaned = line.replace(/\bdebugger\s*;?/g, "");
      return cleaned.trim() === "" || cleaned.trim() === ";" ? "" : cleaned;
    })
    .join("\n");
}

// =============== COMENTARIOS ===============

function removeSimpleComments(code: string): string {
  // Regex que captura strings (comillas dobles, simples, backticks) O comentarios
  const REGEX =
    /("(?:\\[\s\S]|[^"])*"|'(?:\\[\s\S]|[^'])*'|`(?:\\[\s\S]|[^`])*`)|(\/\/.*)/g;

  const SAFE_DIRECTIVES =
    /@(ts-|eslint-|prettier-)|#(region|endregion)|@(preserve|license)/i;

  return code.replace(REGEX, (match, stringGroup, commentGroup) => {
    // Si coincidió con un string (grupo 1), lo devolvemos intacto
    if (stringGroup) return stringGroup;

    // Si es un comentario (grupo 2), verificamos si es seguro
    if (commentGroup) {
      if (SAFE_DIRECTIVES.test(commentGroup)) {
        return commentGroup; // Es una directiva, la dejamos
      }
      return ""; // Es un comentario normal, lo borramos
    }

    return match;
  });
}

// =============== EMOJIS ===============

function removeEmojis(code: string): string {
  // Regex más completo que detecta:
  // - Emojis básicos (\p{Extended_Pictographic})
  // - Símbolos (\p{Symbol})
  // - Modificadores de emojis (variantes de skin tone, ZWJ sequences, etc.)
  return code
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Component}]/gu, "")
    .replace(/\u200d/g, "") // Zero-width joiner (usado en emojis complejos)
    .replace(/\uFE0F/g, "") // Variation selector (usado para emojis)
    .replace(/[\u{1F1E6}-\u{1F1FF}]{2}/gu, "") // Banderas (regional indicators)
    .trim();
}

export function deactivate() {}
