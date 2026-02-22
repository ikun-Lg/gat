use tauri_plugin_keyring::KeyringExt;

const SERVICE_NAME: &str = "com.gat.git.credentials";

#[tauri::command]
pub async fn save_credential(
    app: tauri::AppHandle,
    key: String,
    value: String,
) -> Result<(), String> {
    app.keyring()
        .set_password(SERVICE_NAME, &key, &value)
        .map_err(|e| format!("Failed to save credential: {}", e))
}

#[tauri::command]
pub async fn get_credential(
    app: tauri::AppHandle,
    key: String,
) -> Result<Option<String>, String> {
    app.keyring()
        .get_password(SERVICE_NAME, &key)
        .map_err(|e| format!("Failed to get credential: {}", e))
}

#[tauri::command]
pub async fn delete_credential(
    app: tauri::AppHandle,
    key: String,
) -> Result<(), String> {
    app.keyring()
        .delete_password(SERVICE_NAME, &key)
        .map_err(|e| format!("Failed to delete credential: {}", e))
}

#[tauri::command]
pub async fn list_credentials(_app: tauri::AppHandle) -> Result<Vec<String>, String> {
    // Note: The underlying keyring crate doesn't support listing all keys
    // We'll maintain a list of known keys in our implementation
    // For now, return common credential keys we manage
    Ok(vec![
        "github-token".to_string(),
        "gitlab-token".to_string(),
        "git-username".to_string(),
        "git-password".to_string(),
    ])
}
