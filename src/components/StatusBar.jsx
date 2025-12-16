export function StatusBar(props) {
  return (
    <footer class="status-bar">
      <div class="left">
        <button class="btn" onClick={props.onNew} title="New (Ctrl+N)">
          New
        </button>
        <button class="btn" onClick={props.onOpen} title="Open (Ctrl+O)">
          Open
        </button>
        <button class="btn" onClick={props.onSave} title="Save (Ctrl+S)">
          Save
        </button>
      </div>
      <span class="word-count">
        {props.wordCount} words · {props.charCount} chars
      </span>
      <button
        class="btn preview-toggle"
        onClick={props.onTogglePreview}
        title="Toggle Preview (Ctrl+P)"
      >
        {props.showPreview ? "Edit" : "Preview"}
      </button>
    </footer>
  );
}

