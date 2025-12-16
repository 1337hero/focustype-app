export function TitleBar(props) {
  return (
    <header class="titlebar" data-tauri-drag-region>
      <span class="filename">
        {props.filename}
        {props.isDirty ? " ·" : ""}
      </span>
      <button class="close" onClick={props.onClose} title="Close">
        ×
      </button>
    </header>
  );
}

