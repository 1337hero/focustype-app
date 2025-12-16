import { invoke, isTauri } from "@tauri-apps/api/core";

export function isRunningInTauri() {
  return isTauri();
}

export async function openFileDialog() {
  return invoke("open_file_dialog");
}

export async function saveCurrentFile(content) {
  return invoke("save_current_file", { content });
}

export async function saveFileAsDialog(content, suggestedName) {
  return invoke("save_file_as_dialog", { content, suggestedName });
}

export async function clearCurrentFile() {
  return invoke("clear_current_file");
}

export async function currentFilename() {
  return invoke("current_filename");
}

