import { onCleanup, onMount } from "solid-js";

export function useKeyboardShortcuts(handlers) {
  function onKeydown(e) {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;

    if (e.key === "o") {
      e.preventDefault();
      handlers.openFile?.();
    } else if (e.shiftKey && e.key === "s") {
      e.preventDefault();
      handlers.saveFileAs?.();
    } else if (e.key === "s") {
      e.preventDefault();
      handlers.saveFile?.();
    } else if (e.key === "n") {
      e.preventDefault();
      handlers.newFile?.();
    } else if (e.key === "p") {
      e.preventDefault();
      handlers.togglePreview?.();
    }
  }

  onMount(() => window.addEventListener("keydown", onKeydown));
  onCleanup(() => window.removeEventListener("keydown", onKeydown));
}

