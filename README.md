# Code Cleaner

Limpia tu código en un solo clic.  
**Code Cleaner** es una extensión de Visual Studio Code que elimina automáticamente `console.log`, comentarios innecesarios, sentencias `debugger` y más, ayudándote a mantener tu código limpio y listo para producción.

Ideal para:
- Preparar código antes de un commit o despliegue.
- Eliminar rastros de depuración.
- Mantener estándares de calidad en tu equipo de desarrollo.

---

## Características

Elimina de forma rápida y segura:

- `console.log`, `console.warn`, `console.error`, y otros métodos de consola.
- Comentarios de una o varias líneas (`//` y `/* ... */`).
- Sentencias `debugger`.
- Líneas vacías sobrantes.
- Todo mediante una interfaz simple y directa.

### Modo de uso

1. Abre un archivo en Visual Studio Code.  
2. Ejecuta el comando:  
   **"Code Cleaner: Clean Your Code"**  
3. Selecciona qué deseas eliminar:
   - Solo `console.log`
   - Solo comentarios
   - Solo `debugger`
   - Todo junto  
4. El código quedará limpio y listo para guardar o versionar.

> Consejo: usa esta extensión antes de hacer *push* a tu repositorio para evitar dejar `console.log` o código de depuración por accidente.

---

## Requisitos

No requiere configuración adicional.  
Solo necesitas:
- Visual Studio Code versión **1.103.0** o superior.  
- Node.js (solo si deseas desarrollar o modificar la extensión).

---

## Configuración

Actualmente, Code Cleaner no incluye configuraciones personalizables.  
Sin embargo, se encuentra en desarrollo soporte para definir qué elementos eliminar por defecto mediante `settings.json`.

---

## Problemas conocidos

- No elimina `console.log` dentro de cadenas de texto o comentarios (comportamiento intencional).  
- No soporta eliminación en múltiples archivos simultáneamente (en desarrollo).  
- Los comentarios `TODO` también se eliminan; se añadirá una opción para conservarlos en futuras versiones.

---

## Notas de versión

### 0.0.1
- Versión inicial.  
- Eliminación básica de `console.log`, comentarios y `debugger`.  
- Interfaz de selección mediante menú rápido.

### Próximas mejoras
- Soporte para selección parcial de texto.  
- Limpieza en múltiples archivos o carpetas.  
- Integración opcional con Git hooks.

---

## Buenas prácticas

Esta extensión sigue las [Extension Guidelines de Visual Studio Code](https://code.visualstudio.com/api/references/extension-guidelines), garantizando compatibilidad y estabilidad dentro del entorno.

---

## Autor

**Bryan Baquedano**  
- GitHub: [github.com/enmabry](https://github.com/enmabry)  
- LinkedIn: [linkedin.com/in/bryan-baquedano-57a02524a](https://www.linkedin.com/in/bryan-baquedano-57a02524a/)  

---

## Licencia

Esta extensión se distribuye bajo la licencia [MIT](./LICENSE).

---

© 2025 Bryan Baquedano. Todos los derechos reservados.
