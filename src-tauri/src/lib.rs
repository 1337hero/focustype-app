//! Inkwell - A minimal text editor built with Tauri
//!
//! This module provides the Tauri commands for file operations.

#![warn(
    clippy::all,
    clippy::pedantic,
    clippy::unwrap_used,
    clippy::expect_used,
    missing_docs
)]
#![allow(clippy::must_use_candidate)]

use serde::Serialize;
use std::{
    fs,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
use thiserror::Error;

/// Errors that can occur during file operations.
#[derive(Debug, Error, Serialize)]
#[serde(tag = "type")]
pub enum FileError {
    /// The requested file was not found.
    #[error("File not found")]
    NotFound,

    /// Permission was denied for the file operation.
    #[error("Permission denied")]
    PermissionDenied,

    /// The provided path is invalid or outside allowed directories.
    #[error("Invalid or disallowed path")]
    InvalidPath,

    /// A general I/O error occurred.
    #[error("File operation failed")]
    IoError,

    /// Failed to determine allowed directory.
    #[error("Could not determine allowed directory")]
    ConfigError,

    /// Tried to save without a currently opened file.
    #[error("No file is currently opened")]
    NoOpenFile,
}

impl From<std::io::Error> for FileError {
    fn from(err: std::io::Error) -> Self {
        use std::io::ErrorKind;
        match err.kind() {
            ErrorKind::NotFound => FileError::NotFound,
            ErrorKind::PermissionDenied => FileError::PermissionDenied,
            _ => FileError::IoError,
        }
    }
}

#[derive(Default)]
struct EditorState {
    current_file_path: Mutex<Option<PathBuf>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct OpenedFile {
    filename: String,
    content: String,
}

fn filename_from_path(path: &Path) -> String {
    path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Untitled")
        .to_string()
}

/// Opens a native file picker, reads the chosen file, and sets it as the current file.
///
/// # Security
/// The webview does not provide a path; the user explicitly chooses a file via the OS dialog.
#[tauri::command]
#[allow(clippy::needless_pass_by_value)] // Tauri injects AppHandle by value
async fn open_file_dialog(
    app: AppHandle,
    state: tauri::State<'_, EditorState>,
) -> Result<Option<OpenedFile>, FileError> {
    let picked = app
        .dialog()
        .file()
        .set_title("Open File")
        .add_filter("Markdown", &["md", "markdown", "txt"])
        .add_filter("All Files", &["*"])
        .blocking_pick_file();

    let Some(file_path) = picked else {
        return Ok(None);
    };

    let path = file_path.into_path().map_err(|_| FileError::InvalidPath)?;

    let content = tauri::async_runtime::spawn_blocking({
        let path = path.clone();
        move || fs::read_to_string(path)
    })
    .await
    .map_err(|_| FileError::IoError)??;

    *state
        .current_file_path
        .lock()
        .map_err(|_| FileError::IoError)? = Some(path.clone());

    Ok(Some(OpenedFile {
        filename: filename_from_path(&path),
        content,
    }))
}

/// Saves content to the currently opened file (no file picker).
///
/// # Security
/// Only writes to a path previously selected via [`open_file_dialog`] or [`save_file_as_dialog`].
#[tauri::command]
async fn save_current_file(
    state: tauri::State<'_, EditorState>,
    content: String,
) -> Result<(), FileError> {
    let path = state
        .current_file_path
        .lock()
        .map_err(|_| FileError::IoError)?
        .clone()
        .ok_or(FileError::NoOpenFile)?;

    tauri::async_runtime::spawn_blocking(move || fs::write(path, content))
        .await
        .map_err(|_| FileError::IoError)??;

    Ok(())
}

/// Opens a native "Save As" dialog, writes content to the chosen path, and sets it as current.
#[tauri::command]
#[allow(clippy::needless_pass_by_value)] // Tauri injects AppHandle by value
async fn save_file_as_dialog(
    app: AppHandle,
    state: tauri::State<'_, EditorState>,
    content: String,
    suggested_name: Option<String>,
) -> Result<Option<String>, FileError> {
    let mut dialog = app
        .dialog()
        .file()
        .set_title("Save File")
        .add_filter("Markdown", &["md"])
        .add_filter("Text", &["txt"])
        .add_filter("All Files", &["*"]);

    if let Some(name) = suggested_name {
        dialog = dialog.set_file_name(name);
    }

    let picked = dialog.blocking_save_file();
    let Some(file_path) = picked else {
        return Ok(None);
    };

    let path = file_path.into_path().map_err(|_| FileError::InvalidPath)?;

    let filename = filename_from_path(&path);

    tauri::async_runtime::spawn_blocking({
        let path = path.clone();
        move || fs::write(path, content)
    })
    .await
    .map_err(|_| FileError::IoError)??;

    *state
        .current_file_path
        .lock()
        .map_err(|_| FileError::IoError)? = Some(path);

    Ok(Some(filename))
}

/// Clears the currently opened file.
#[tauri::command]
#[allow(clippy::needless_pass_by_value)] // Tauri injects State by value
fn clear_current_file(state: tauri::State<'_, EditorState>) -> Result<(), FileError> {
    *state
        .current_file_path
        .lock()
        .map_err(|_| FileError::IoError)? = None;
    Ok(())
}

/// Returns the filename of the currently opened file, if any.
#[tauri::command]
#[allow(clippy::needless_pass_by_value)] // Tauri injects State by value
fn current_filename(state: tauri::State<'_, EditorState>) -> Result<Option<String>, FileError> {
    Ok(state
        .current_file_path
        .lock()
        .map_err(|_| FileError::IoError)?
        .as_deref()
        .map(filename_from_path))
}

/// Initializes and runs the Tauri application.
///
/// # Panics
/// Panics if the Tauri application fails to initialize.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
#[allow(clippy::expect_used)] // Panicking is appropriate if the app fails to start
pub fn run() {
    tauri::Builder::default()
        .manage(EditorState::default())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            open_file_dialog,
            save_current_file,
            save_file_as_dialog,
            clear_current_file,
            current_filename
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
