use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;
use chrono::Utc;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct OperationLogEntry {
    pub timestamp: String,
    pub operation: String,
    pub details: String,
    pub repo_path: String,
    pub success: bool,
    pub error: Option<String>,
}

const LOG_DIR: &str = ".gat";
const LOG_FILE: &str = "operations.log";

fn get_log_file_path(repo_path: &str) -> PathBuf {
    let mut path = PathBuf::from(repo_path);
    path.push(LOG_DIR);
    path.push(LOG_FILE);
    path
}

pub fn ensure_log_dir_exists(repo_path: &str) -> Result<(), Box<dyn std::error::Error>> {
    let mut log_dir = PathBuf::from(repo_path);
    log_dir.push(LOG_DIR);
    
    if !log_dir.exists() {
        std::fs::create_dir_all(&log_dir)?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn log_operation(
    operation: String,
    details: String,
    repo_path: String,
    success: bool,
    error: Option<String>,
) -> Result<(), String> {
    let entry = OperationLogEntry {
        timestamp: Utc::now().to_rfc3339(),
        operation,
        details,
        repo_path: repo_path.clone(),
        success,
        error,
    };
    
    let log_line = serde_json::to_string(&entry)
        .map_err(|e| format!("Failed to serialize log entry: {}", e))?;
    
    ensure_log_dir_exists(&repo_path)
        .map_err(|e| format!("Failed to create log directory: {}", e))?;
    
    let log_path = get_log_file_path(&repo_path);
    
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(|e| format!("Failed to open log file: {}", e))?;
    
    writeln!(file, "{}", log_line)
        .map_err(|e| format!("Failed to write to log file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_operation_logs(repo_path: String, limit: Option<usize>) -> Result<Vec<OperationLogEntry>, String> {
    let log_path = get_log_file_path(&repo_path);
    
    if !log_path.exists() {
        return Ok(Vec::new());
    }
    
    let content = std::fs::read_to_string(&log_path)
        .map_err(|e| format!("Failed to read log file: {}", e))?;
    
    let mut logs: Vec<OperationLogEntry> = content
        .lines()
        .filter_map(|line| {
            serde_json::from_str(line).ok()
        })
        .collect();
    
    // Sort by timestamp descending
    logs.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));
    
    // Apply limit if specified
    if let Some(limit) = limit {
        logs.truncate(limit);
    }
    
    Ok(logs)
}

#[tauri::command]
pub async fn clear_operation_logs(repo_path: String) -> Result<(), String> {
    let log_path = get_log_file_path(&repo_path);
    
    if log_path.exists() {
        std::fs::remove_file(&log_path)
            .map_err(|e| format!("Failed to remove log file: {}", e))?;
    }
    
    Ok(())
}
