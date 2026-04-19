use std::fs;
use std::path::Path;
use serde::Serialize;
use ignore::WalkBuilder;
use regex::RegexBuilder;

#[derive(Serialize, Clone)]
pub struct SearchResultNode {
    pub path: String,
    pub matches: Vec<SearchMatch>,
}

#[derive(Serialize, Clone)]
pub struct SearchMatch {
    pub line_number: usize,
    pub line_content: String,
}

#[derive(Serialize, Clone)]
pub struct FileNode {
    pub name: String,
    pub path: String,
    pub is_directory: bool,
    pub children: Option<Vec<FileNode>>,
}

fn is_path_safe(path: &Path) -> bool {
    // Basic protection: prevent obvious traversal attempts
    // In a production app, this should be checked against an allowed "workspace root"
    let path_str = path.to_string_lossy();
    if path_str.contains("..") {
        return false;
    }
    true
}

#[tauri::command]
fn read_dir_recursive(path: String) -> Result<Vec<FileNode>, String> {
    let root = Path::new(&path);
    if !is_path_safe(root) {
        return Err("Unauthorized or unsafe path access denied.".into());
    }
    if !root.exists() {
        return Err(format!("Path does not exist: {}", path));
    }
    if !root.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }
    walk_dir(root).map_err(|e| e.to_string())
}

fn walk_dir(dir: &Path) -> Result<Vec<FileNode>, std::io::Error> {
    let mut entries: Vec<FileNode> = Vec::new();

    let mut dir_entries: Vec<_> = fs::read_dir(dir)?
        .filter_map(|e| e.ok())
        .collect();

    // Sort: directories first, then alphabetical (case-insensitive)
    dir_entries.sort_by(|a, b| {
        let a_is_dir = a.file_type().map(|t| t.is_dir()).unwrap_or(false);
        let b_is_dir = b.file_type().map(|t| t.is_dir()).unwrap_or(false);
        match (a_is_dir, b_is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.file_name().to_string_lossy().to_lowercase()
                .cmp(&b.file_name().to_string_lossy().to_lowercase()),
        }
    });

    for entry in dir_entries {
        let entry_path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();

        // Skip hidden files/directories and common noise
        if name.starts_with('.') || name == "node_modules" || name == "target" || name == "__pycache__" {
            continue;
        }

        let is_dir = entry_path.is_dir();
        let children = if is_dir {
            Some(walk_dir(&entry_path)?)
        } else {
            None
        };

        entries.push(FileNode {
            name,
            path: entry_path.to_string_lossy().to_string(),
            is_directory: is_dir,
            children,
        });
    }

    Ok(entries)
}

#[tauri::command]
fn search_workspace(path: String, query: String, case_sensitive: bool) -> Result<Vec<SearchResultNode>, String> {
    let root = Path::new(&path);
    if !is_path_safe(root) {
        return Err("Unauthorized or unsafe path access denied.".into());
    }
    let re = RegexBuilder::new(&query)
        .case_insensitive(!case_sensitive)
        .build()
        .map_err(|e| e.to_string())?;

    let mut results = Vec::new();
    
    for result in WalkBuilder::new(&path).build() {
        let entry = match result {
            Ok(e) => e,
            Err(_) => continue,
        };
        // Skip hidden and common binary files/dirs just in case WalkBuilder didn't catch via ignore
        if entry.file_type().map_or(false, |ft| ft.is_file()) {
            let file_path = entry.path();
            
            // Protect against OOM panics with large binary files
            if let Ok(metadata) = fs::metadata(file_path) {
                if metadata.len() > 5_000_000 { // 5MB max
                    continue;
                }
            }

            if let Ok(content) = fs::read_to_string(file_path) {
                let mut matches = Vec::new();
                for (i, line) in content.lines().enumerate() {
                    if re.is_match(line) {
                        matches.push(SearchMatch {
                            line_number: i + 1,
                            line_content: line.trim().to_string(),
                        });
                    }
                }
                if !matches.is_empty() {
                    results.push(SearchResultNode {
                        path: file_path.to_string_lossy().to_string(),
                        matches,
                    });
                }
            }
        }
    }
    
    Ok(results)
}

#[tauri::command]
fn read_file_content(path: String) -> Result<String, String> {
    let p = Path::new(&path);
    if !is_path_safe(p) {
        return Err("Unauthorized or unsafe path access denied.".into());
    }
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file {}: {}", path, e))
}

#[tauri::command]
fn save_file_content(path: String, content: String) -> Result<(), String> {
    let p = Path::new(&path);
    if !is_path_safe(p) {
        return Err("Unauthorized or unsafe path access denied.".into());
    }
    fs::write(&path, &content).map_err(|e| format!("Failed to save file {}: {}", path, e))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_pty::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            read_dir_recursive,
            read_file_content,
            save_file_content,
            search_workspace
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
