use std::process::Command;

#[tauri::command]
pub async fn get_gpg_keys() -> Result<Vec<GpgKeyInfo>, String> {
    let output = Command::new("gpg")
        .args(["--list-keys", "--with-colons"])
        .output()
        .map_err(|e| format!("GPG not found: {}", e))?;

    if !output.status.success() {
        return Ok(Vec::new());
    }

    let content = String::from_utf8_lossy(&output.stdout);
    let mut keys = Vec::new();
    let mut current_key: Option<GpgKeyInfo> = None;

    for line in content.lines() {
        let parts: Vec<&str> = line.split(':').collect();
        if parts.is_empty() {
            continue;
        }

        match parts.get(0).map(|s| s.as_ref()) {
            Some("pub") => {
                if let Some(key) = current_key.take() {
                    keys.push(key);
                }

                let key_id = parts.get(4).unwrap_or(&"").to_string();
                let date_str = parts.get(5).unwrap_or(&"");
                let created_date = parse_gpg_date(date_str);

                current_key = Some(GpgKeyInfo {
                    key_id: key_id.clone(),
                    user_id: String::new(),
                    email: String::new(),
                    created_at: created_date,
                    has_private_key: false,
                });
            }
            Some("uid") => {
                if let Some(ref mut key) = current_key {
                    let user_id = parts.get(9).unwrap_or(&"").to_string();
                    if !user_id.is_empty() && key.user_id.is_empty() {
                        key.user_id = user_id.clone();
                        
                        // Extract email from user ID
                        if let Some(email_start) = user_id.find('<') {
                            if let Some(email_end) = user_id.find('>') {
                                key.email = user_id[email_start + 1..email_end].to_string();
                            }
                        }
                    }
                }
            }
            _ => {}
        }
    }

    if let Some(key) = current_key {
        keys.push(key);
    }

    // Check which keys have private keys
    for key in &mut keys {
        let output = Command::new("gpg")
            .args(["--list-secret-keys", &key.key_id])
            .output();

        if let Ok(out) = output {
            key.has_private_key = out.status.success();
        }
    }

    Ok(keys)
}

#[tauri::command]
pub async fn configure_gpg_signing(
    repo_path: String,
    key_id: String,
    sign_all: bool,
) -> Result<(), String> {
    // Set commit.gpgsign
    let output = Command::new("git")
        .args(["-C", &repo_path, "config", "commit.gpgsign", "true"])
        .output()
        .map_err(|e| format!("Failed to configure GPG signing: {}", e))?;

    if !output.status.success() {
        return Err(format!("Failed to enable GPG signing: {}",
            String::from_utf8_lossy(&output.stderr)));
    }

    // Set user.signingkey
    let output = Command::new("git")
        .args(["-C", &repo_path, "config", "user.signingkey", &key_id])
        .output()
        .map_err(|e| format!("Failed to set signing key: {}", e))?;

    if !output.status.success() {
        return Err(format!("Failed to set signing key: {}",
            String::from_utf8_lossy(&output.stderr)));
    }

    if sign_all {
        // Set gpg.program and tag.gpgsign
        let output = Command::new("git")
            .args(["-C", &repo_path, "config", "tag.gpgsign", "true"])
            .output()
            .map_err(|e| format!("Failed to enable tag signing: {}", e))?;

        if !output.status.success() {
            return Err(format!("Failed to enable tag signing: {}",
                String::from_utf8_lossy(&output.stderr)));
        }
    }

    Ok(())
}

#[tauri::command]
pub async fn disable_gpg_signing(repo_path: String) -> Result<(), String> {
    let output = Command::new("git")
        .args(["-C", &repo_path, "config", "--unset", "commit.gpgsign"])
        .output();

    let output2 = Command::new("git")
        .args(["-C", &repo_path, "config", "--unset", "user.signingkey"])
        .output();

    if output.is_err() && output2.is_err() {
        return Err("Failed to disable GPG signing".to_string());
    }

    Ok(())
}

fn parse_gpg_date(date_str: &str) -> Option<String> {
    if date_str.is_empty() || date_str == "-" {
        return None;
    }

    // GPG dates are Unix timestamps
    match date_str.parse::<i64>() {
        Ok(timestamp) => {
            use chrono::{TimeZone, Utc};
            let datetime = Utc.timestamp_opt(timestamp, 0).single()?;
            Some(datetime.to_rfc3339())
        }
        Err(_) => None,
    }
}

#[derive(serde::Serialize, Clone)]
pub struct GpgKeyInfo {
    pub key_id: String,
    pub user_id: String,
    pub email: String,
    pub created_at: Option<String>,
    pub has_private_key: bool,
}
