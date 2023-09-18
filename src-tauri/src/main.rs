// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs::File;
use std::io::prelude::*;

#[tauri::command(rename_all = "snake_case")]
fn save_as_file(text: String, path: String) {
    let mut file = File::create(path).expect("error creating txt file");
    let _ = file.write_all(text.as_bytes());
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![save_as_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}