import { createMemo, createSignal } from "solid-js";
import * as tauri from "@/lib/tauri";
import { renderMarkdown } from "./markdown";
import { countWords } from "./stats";

export function createEditorController() {
  const [content, setContent] = createSignal("");
  const [filename, setFilename] = createSignal("Untitled");
  const [hasOpenFile, setHasOpenFile] = createSignal(false);
  const [isDirty, setIsDirty] = createSignal(false);
  const [showPreview, setShowPreview] = createSignal(false);

  const wordCount = createMemo(() => countWords(content()));
  const charCount = createMemo(() => content().length);
  const previewHtml = createMemo(() => renderMarkdown(content()));

  async function openFile() {
    const opened = await tauri.openFileDialog();
    if (!opened) return;
    setContent(opened.content);
    setFilename(opened.filename);
    setHasOpenFile(true);
    setIsDirty(false);
  }

  async function saveFile() {
    if (!hasOpenFile()) return saveFileAs();
    await tauri.saveCurrentFile(content());
    setIsDirty(false);
  }

  async function saveFileAs() {
    const name = filename();
    const suggestedName = name.endsWith(".md") ? name : `${name}.md`;
    const savedName = await tauri.saveFileAsDialog(content(), suggestedName);
    if (!savedName) return;
    setFilename(savedName);
    setHasOpenFile(true);
    setIsDirty(false);
  }

  async function newFile() {
    setContent("");
    setFilename("Untitled");
    setHasOpenFile(false);
    setIsDirty(false);
    await tauri.clearCurrentFile();
  }

  function updateContent(next) {
    setContent(next);
    setIsDirty(true);
  }

  function togglePreview() {
    setShowPreview((p) => !p);
  }

  return {
    state: { content, filename, hasOpenFile, isDirty, showPreview },
    derived: { wordCount, charCount, previewHtml },
    actions: { openFile, saveFile, saveFileAs, newFile, updateContent, togglePreview },
  };
}

