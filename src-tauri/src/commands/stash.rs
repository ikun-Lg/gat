use crate::domain::StashInfo;
use crate::error::{AppError, Result};
use git2::{Repository, StashApplyOptions, StashFlags};

#[tauri::command]
pub async fn get_stash_list(path: String) -> std::result::Result<Vec<StashInfo>, String> {
    get_stash_list_impl(&path).map_err(|e: AppError| e.to_string())
}

fn get_stash_list_impl(path: &str) -> Result<Vec<StashInfo>> {
    let mut repo = Repository::open(path)?;
    let mut stashes = Vec::new();

    repo.stash_foreach(|index, message, id| {
        stashes.push(StashInfo {
            index,
            message: message.to_string(),
            id: id.to_string(),
        });
        true
    })?;

    Ok(stashes)
}

#[tauri::command]
pub async fn stash_save(
    path: String,
    message: Option<String>,
    include_untracked: bool,
) -> std::result::Result<(), String> {
    stash_save_impl(&path, message.as_deref(), include_untracked).map_err(|e: AppError| e.to_string())
}

fn stash_save_impl(path: &str, message: Option<&str>, include_untracked: bool) -> Result<()> {
    let mut repo = Repository::open(path)?;
    let signature = repo.signature()?;
    
    let mut flags = StashFlags::DEFAULT;
    if include_untracked {
        flags |= StashFlags::INCLUDE_UNTRACKED;
    }

    repo.stash_save(&signature, message.unwrap_or(""), Some(flags))?;
    Ok(())
}

#[tauri::command]
pub async fn stash_apply(path: String, index: usize) -> std::result::Result<(), String> {
    stash_apply_impl(&path, index).map_err(|e: AppError| e.to_string())
}

fn stash_apply_impl(path: &str, index: usize) -> Result<()> {
    let mut repo = Repository::open(path)?;
    let mut opts = StashApplyOptions::new();
    repo.stash_apply(index, Some(&mut opts))?;
    Ok(())
}

#[tauri::command]
pub async fn stash_pop(path: String, index: usize) -> std::result::Result<(), String> {
    stash_pop_impl(&path, index).map_err(|e: AppError| e.to_string())
}

fn stash_pop_impl(path: &str, index: usize) -> Result<()> {
    let mut repo = Repository::open(path)?;
    let mut opts = StashApplyOptions::new();
    repo.stash_pop(index, Some(&mut opts))?;
    Ok(())
}

#[tauri::command]
pub async fn stash_drop(path: String, index: usize) -> std::result::Result<(), String> {
    stash_drop_impl(&path, index).map_err(|e: AppError| e.to_string())
}

fn stash_drop_impl(path: &str, index: usize) -> Result<()> {
    let mut repo = Repository::open(path)?;
    repo.stash_drop(index)?;
    Ok(())
}
