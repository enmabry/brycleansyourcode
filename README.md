# BryCleansYourCode

¡Limpia tu código en un solo clic!  
**BryCleansYourCode** es una extensión de Visual Studio Code que elimina automáticamente `console.log`, comentarios innecesarios, `debugger` statements y más, ayudándote a mantener tu código limpio y listo para producción.

Ideal para:
- Preparar código antes de un commit o deploy.
- Eliminar rastros de depuración.
- Mantener estándares de calidad en tu equipo.

---

## 🚀 Características

Elimina de forma rápida y segura:

- ✅ `console.log`, `console.warn`, `console.error`, etc.
- ✅ Comentarios (`//` y `/* */`)
- ✅ Sentencias `debugger`
- ✅ Líneas vacías sobrantes
- 🎯 Todo con una interfaz sencilla y personalizable.

### ¿Cómo funciona?

1. Abre un archivo.
2. Ejecuta el comando: **"Bry: cleans your code"**.
3. Elige qué eliminar:
   - Solo `console.log`
   - Solo comentarios
   - Solo `debugger`
   - Todo junto
4. ¡Listo! Tu código queda limpio.

![Demo de BryCleansYourCode](images/demo.gif)

> 💡 *Consejo: Usa esta extensión antes de hacer push a tu repositorio para evitar dejar `console.log` por accidente.*

---

## 🔧 Requisitos

No requiere configuración adicional.  
Solo necesitas:
- Visual Studio Code (versión 1.103.0 o superior)
- Node.js (para desarrollo o personalización)

---

## ⚙️ Configuración de la extensión

Actualmente, BryCleansYourCode no agrega configuraciones personalizables, pero está diseñada para ser intuitiva y lista para usar.

> 🔮 Próximamente: soporte para configurar qué elementos eliminar por defecto mediante `settings.json`.

---

## ⚠️ Problemas conocidos

- No elimina `console.log` dentro de cadenas o comentarios (comportamiento esperado).
- No soporta eliminación en múltiples archivos (próximamente).
- Los comentarios `TODO` también se eliminan (en futuras versiones se podrán excluir).

---

## 📝 Notas de versión

### 0.0.1
- Versión inicial.
- Eliminación básica de `console.log`, comentarios y `debugger`.
- Interfaz de selección con menú rápido.

### Próximas mejoras
- Soporte para selección de texto parcial.
- Exclusión de `TODO` y `FIXME`.
- Limpieza en múltiples archivos o carpetas.
- Integración con Git hooks (opcional).

---

## 📚 Sigue las mejores prácticas

Esta extensión sigue las [Extension Guidelines de VS Code](https://code.visualstudio.com/api/references/extension-guidelines) para integrarse perfectamente con la interfaz nativa.

---

## 🙌 ¡Gracias por usar BryCleansYourCode!

Si te gusta esta extensión, considera dejar una reseña en el [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/) o contribuir con ideas en GitHub.

**¡Haz que tu código brille sin basura!** ✨