use crate::error::{AppError, Result};
use std::process::Command;

#[tauri::command]
pub async fn open_in_external_editor(path: String, editor: String) -> std::result::Result<(), String> {
    open_in_external_editor_impl(&path, &editor).map_err(|e| e.to_string())
}

fn open_in_external_editor_impl(path: &str, editor: &str) -> Result<()> {
    #[cfg(target_os = "macos")]
    {
        let mut command = match editor {
            "code" => {
                let mut cmd = Command::new("code");
                cmd.arg(path);
                cmd
            }
            "cursor" => {
                let mut cmd = Command::new("cursor");
                cmd.arg(path);
                cmd
            }
            "idea" => {
                let mut cmd = Command::new("idea");
                cmd.arg(path);
                cmd
            }
            "webstorm" => {
                let mut cmd = Command::new("webstorm");
                cmd.arg(path);
                cmd
            }
            "sublime" => {
                let mut cmd = Command::new("subl");
                cmd.arg(path);
                cmd
            }
            _ => {
                // If it's a custom path or unknown, try to run it directly
                let mut cmd = Command::new(editor);
                cmd.arg(path);
                cmd
            }
        };

        let status = command.status().map_err(|e| AppError::Io(e))?;
        if !status.success() {
            // If failed, try using 'open -a' as a fallback for Mac
            let app_name = match editor {
                "code" => Some("Visual Studio Code"),
                "cursor" => Some("Cursor"),
                "idea" => Some("IntelliJ IDEA"),
                "webstorm" => Some("WebStorm"),
                "sublime" => Some("Sublime Text"),
                _ => None,
            };

            if let Some(app) = app_name {
                let status = Command::new("open")
                    .arg("-a")
                    .arg(app)
                    .arg(path)
                    .status()
                    .map_err(|e| AppError::Io(e))?;
                
                if !status.success() {
                    return Err(AppError::InvalidInput(format!("Failed to open editor: {}", editor)));
                }
            } else {
                return Err(AppError::InvalidInput(format!("Failed to open editor: {}", editor)));
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        let (cmd, args) = match editor {
            "code" => ("code.cmd", vec![path]),
            "cursor" => ("cursor.cmd", vec![path]),
            _ => (editor, vec![path]),
        };

        let status = Command::new("cmd")
            .arg("/c")
            .arg(cmd)
            .args(args)
            .status()
            .map_err(|e| AppError::Io(e))?;

        if !status.success() {
            return Err(AppError::InvalidInput(format!("Failed to open editor: {}", editor)));
        }
    }

    #[cfg(target_os = "linux")]
    {
        let status = Command::new(editor)
            .arg(path)
            .status()
            .map_err(|e| AppError::Io(e))?;

        if !status.success() {
            return Err(AppError::InvalidInput(format!("Failed to open editor: {}", editor)));
        }
    }

    Ok(())
}
