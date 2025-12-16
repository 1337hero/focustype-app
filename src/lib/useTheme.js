import { onMount } from 'solid-js';

/**
 * Apply theme class to document.
 * Tauri's theme detection is unreliable on Linux/Gnome, so we default to dark.
 * TODO: Add manual toggle or read from gsettings if needed.
 */
export function useTheme() {
  onMount(() => {
    document.documentElement.classList.add('dark');
  });
}

