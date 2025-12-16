# FocusType

A minimal, distraction-free Markdown editor built with Tauri 2, SolidJS, and Rust.

## Features

- **Distraction-free writing** — Clean interface with no clutter
- **Live Markdown preview** — Toggle between editing and rendered preview
- **Custom caret** — Styleable cursor with configurable thickness and color
- **Native file dialogs** — Open and save files through OS-native dialogs
- **Typography-focused** — iA Writer-inspired font stack and 72ch measure
- **Dark mode** — Easy on the eyes

## Tech Stack

- **Frontend**: SolidJS + Vite
- **Backend**: Rust + Tauri 2
- **Styling**: Vanilla CSS with CSS variables

## Development

```bash
# Install dependencies
bun install

# Run development server
bun run tauri dev

# Build for production
bun run tauri build
```

## Project Structure

```
src/                    # SolidJS frontend
  components/           # UI components
  features/editor/      # Editor state management
  lib/                  # Utilities (Tauri IPC, caret positioning, theme)
  styles/               # CSS

src-tauri/              # Rust backend
  src/lib.rs            # Tauri commands and app setup
```

## Customization

Edit CSS variables in `src/styles/styles.css`:

```css
:root {
  --caret-color: oklch(58.8% 0.158 241.966);
  --caret-width: 2px;
  /* ... */
}
```

## License

MIT
