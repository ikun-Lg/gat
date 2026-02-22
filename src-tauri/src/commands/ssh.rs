use std::process::Command;

#[tauri::command]
pub async fn generate_ssh_key(
    email: String,
    key_type: String,
    comment: Option<String>,
) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Failed to get home directory")?;
    let ssh_dir = home.join(".ssh");
    
    // Create .ssh directory if it doesn't exist
    if !ssh_dir.exists() {
        std::fs::create_dir_all(&ssh_dir)
            .map_err(|e| format!("Failed to create .ssh directory: {}", e))?;
    }
    
    let key_comment = comment.unwrap_or_else(|| format!("{}-gat", email));
    let key_path = ssh_dir.join(format!("id_{}", key_type));
    
    if key_path.exists() {
        return Err(format!("SSH key already exists: {}", key_path.display()));
    }
    
    // Generate SSH key using ssh-keygen
    let output = Command::new("ssh-keygen")
        .args([
            "-t", &key_type,
            "-C", &key_comment,
            "-f", key_path.to_str().unwrap(),
            "-N", "", // No passphrase
        ])
        .output()
        .map_err(|e| format!("Failed to run ssh-keygen: {}", e))?;
    
    if !output.status.success() {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        return Err(format!("ssh-keygen failed: {}", error_msg));
    }
    
    // Read the public key
    let pub_key_path = format!("{}.pub", key_path.display());
    let public_key = std::fs::read_to_string(&pub_key_path)
        .map_err(|e| format!("Failed to read public key: {}", e))?;
    
    Ok(public_key.trim().to_string())
}

#[tauri::command]
pub async fn get_ssh_keys() -> Result<Vec<SshKeyInfo>, String> {
    let home = dirs::home_dir().ok_or("Failed to get home directory")?;
    let ssh_dir = home.join(".ssh");
    
    if !ssh_dir.exists() {
        return Ok(Vec::new());
    }
    
    let mut keys = Vec::new();
    
    // Common SSH key types
    let key_types = ["rsa", "ed25519", "ecdsa", "dsa"];
    
    for key_type in key_types {
        let key_path = ssh_dir.join(format!("id_{}", key_type));
        let pub_key_path = ssh_dir.join(format!("id_{}.pub", key_type));
        
        if pub_key_path.exists() {
            let public_key = std::fs::read_to_string(&pub_key_path)
                .map_err(|e| format!("Failed to read public key: {}", e))?;
            
            let metadata = std::fs::metadata(&key_path);
            let created_at: Option<String> = metadata
                .ok()
                .and_then(|m| m.created().ok())
                .map(|t: std::time::SystemTime| {
                    let duration: std::time::Duration = t.elapsed().unwrap_or_default();
                    let datetime = chrono::Utc::now() - chrono::Duration::seconds(duration.as_secs() as i64);
                    datetime.to_rfc3339()
                });
            
            keys.push(SshKeyInfo {
                key_type: key_type.to_string(),
                path: key_path.display().to_string(),
                public_key: public_key.trim().to_string(),
                has_private_key: key_path.exists(),
                created_at,
            });
        }
    }
    
    Ok(keys)
}

#[tauri::command]
pub async fn delete_ssh_key(key_type: String) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Failed to get home directory")?;
    let ssh_dir = home.join(".ssh");
    let key_path = ssh_dir.join(format!("id_{}", key_type));
    let pub_key_path = ssh_dir.join(format!("id_{}.pub", key_type));
    
    if key_path.exists() {
        std::fs::remove_file(&key_path)
            .map_err(|e| format!("Failed to delete private key: {}", e))?;
    }
    
    if pub_key_path.exists() {
        std::fs::remove_file(&pub_key_path)
            .map_err(|e| format!("Failed to delete public key: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn read_ssh_public_key(key_type: String) -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Failed to get home directory")?;
    let ssh_dir = home.join(".ssh");
    let pub_key_path = ssh_dir.join(format!("id_{}.pub", key_type));
    
    if !pub_key_path.exists() {
        return Err(format!("Public key not found for type: {}", key_type));
    }
    
    let public_key = std::fs::read_to_string(&pub_key_path)
        .map_err(|e| format!("Failed to read public key: {}", e))?;
    
    Ok(public_key.trim().to_string())
}

#[derive(serde::Serialize, Clone)]
pub struct SshKeyInfo {
    pub key_type: String,
    pub path: String,
    pub public_key: String,
    pub has_private_key: bool,
    pub created_at: Option<String>,
}
