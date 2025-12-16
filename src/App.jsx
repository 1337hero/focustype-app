import { EditorPane } from "@/components/EditorPane";
import { PreviewPane } from "@/components/PreviewPane";
import { StatusBar } from "@/components/StatusBar";
import { TitleBar } from "@/components/TitleBar";
import { createEditorController } from "@/features/editor/createEditorController";
import { useKeyboardShortcuts } from "@/features/editor/useKeyboardShortcuts";
import { isRunningInTauri } from "@/lib/tauri";
import { useTheme } from "@/lib/useTheme";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Show } from "solid-js";

function App() {
  const editor = createEditorController();
  const appWindow = isRunningInTauri() ? getCurrentWindow() : null;

  useTheme();
  useKeyboardShortcuts(editor.actions);

  return (
    <div class="window">
      <TitleBar
        filename={editor.state.filename()}
        isDirty={editor.state.isDirty()}
        onClose={() => (appWindow ? appWindow.close() : window.close())}
      />

      <main class="editor-container">
        <Show
          when={editor.state.showPreview()}
          fallback={
            <EditorPane value={editor.state.content()} onChange={editor.actions.updateContent} />
          }
        >
          <PreviewPane html={editor.derived.previewHtml()} />
        </Show>

        <StatusBar
          wordCount={editor.derived.wordCount()}
          charCount={editor.derived.charCount()}
          showPreview={editor.state.showPreview()}
          onNew={editor.actions.newFile}
          onOpen={editor.actions.openFile}
          onSave={editor.actions.saveFile}
          onTogglePreview={editor.actions.togglePreview}
        />
      </main>
    </div>
  );
}

export default App;
