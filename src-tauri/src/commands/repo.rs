use crate::domain::{RepositoryInfo, RepoStatus, StatusItem, BranchInfo, CommitInfo};
use crate::error::{AppError, Result};
use git2::{Repository, StatusOptions};
use ignore::WalkBuilder;
use std::path::Path;
use rayon::prelude::*;

/// Scan a directory recursively for Git repositories
#[tauri::command]
pub async fn scan_repositories(root_path: String) -> std::result::Result<Vec<RepositoryInfo>, String> {
    scan_repositories_impl(&root_path).map_err(|e| e.to_string())
}

fn scan_repositories_impl(root_path: &str) -> Result<Vec<RepositoryInfo>> {
    let root = Path::new(root_path);

    if !root.exists() {
        return Err(AppError::RepoNotFound(root_path.to_string()));
    }

    let mut git_dirs = Vec::new();

    // Use ignore crate to walk the directory
    let walk = WalkBuilder::new(root)
        .hidden(false)
        .ignore(false)
        .git_ignore(false)
        .build();

    for entry in walk {
        if let Ok(entry) = entry {
            let path = entry.path();
            if path.join(".git").is_dir() {
                git_dirs.push(path.to_path_buf());
            }
        }
    }

    // Process repositories in parallel
    let repos: Result<Vec<_>> = git_dirs
        .par_iter()
        .map(|path| get_repository_info(path))
        .collect();

    // Sort by name
    let mut repos = repos?;
    repos.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(repos)
}

/// Get info for a single repository
fn get_repository_info(path: &Path) -> Result<RepositoryInfo> {
    let repo = Repository::open(path)?;
    let head = repo.head();

    let name = path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("Unknown")
        .to_string();

    let branch = match &head {
        Ok(head) => head
            .shorthand()
            .map(|s| s.to_string()),
        Err(_) => None,
    };

    let status = get_repo_status_impl(&repo)?;

    // Get ahead/behind counts
    let (ahead, behind) = get_ahead_behind(&repo)?;

    Ok(RepositoryInfo {
        path: path.to_string_lossy().to_string(),
        name,
        branch,
        has_changes: status.has_changes(),
        staged_count: status.staged.len(),
        unstaged_count: status.unstaged.len(),
        untracked_count: status.untracked.len(),
        ahead,
        behind,
    })
}

/// Get ahead/behind counts for the current branch
fn get_ahead_behind(repo: &Repository) -> Result<(usize, usize)> {
    let head = repo.head().ok();
    let head_commit = head.as_ref().and_then(|h| h.peel_to_commit().ok());
    let branch_name = head.as_ref().and_then(|h| h.shorthand().map(|s| s.to_string()));

    let (ahead, behind) = (0, 0);

    if let (Some(head_oid), Some(_), Some(branch_name)) = (head.and_then(|h| h.target()), head_commit, branch_name) {
        if let Ok(branch_obj) = repo.find_branch(&branch_name, git2::BranchType::Local) {
            if let Ok(upstream) = branch_obj.upstream() {
                if let Ok(upstream_commit) = upstream.into_reference().peel_to_commit() {
                    let _ = repo.graph_ahead_behind(head_oid, upstream_commit.id());
                }
            }
        }
    }

    Ok((ahead, behind))
}

/// Get detailed status for a specific repository
#[tauri::command]
pub async fn get_repo_status(path: String) -> std::result::Result<RepoStatus, String> {
    let repo = Repository::open(&path).map_err(|e| e.to_string())?;
    get_repo_status_impl(&repo).map_err(|e| e.to_string())
}

fn get_repo_status_impl(repo: &Repository) -> Result<RepoStatus> {
    let mut status_opts = StatusOptions::new();
    status_opts.include_untracked(true);
    status_opts.recurse_untracked_dirs(true);
    status_opts.recurse_ignored_dirs(false);

    let statuses = repo.statuses(Some(&mut status_opts))?;

    let mut repo_status = RepoStatus::new();

    for entry in statuses.iter() {
        let status = entry.status();
        let path = entry.path().unwrap_or("").to_string();

        let item = StatusItem {
            path: path.clone(),
            status: status.into(),
            old_path: None,
        };

        // Categorize the file
        if status.is_index_deleted()
            || status.is_index_modified()
            || status.is_index_renamed()
            || status.is_index_new()
            || status.is_index_typechange()
        {
            repo_status.staged.push(item.clone());
        }

        if status.is_wt_deleted()
            || status.is_wt_modified()
            || status.is_wt_renamed()
            || status.is_wt_typechange()
        {
            repo_status.unstaged.push(item.clone());
        }

        if status.is_wt_new() {
            repo_status.untracked.push(item.clone());
        }

        if status.is_conflicted() {
            repo_status.conflicted.push(item);
        }
    }

    Ok(repo_status)
}

/// Get branch info for a repository
#[tauri::command]
pub async fn get_branch_info(path: String) -> std::result::Result<BranchInfo, String> {
    let repo = Repository::open(&path).map_err(|e| e.to_string())?;
    get_branch_info_impl(&repo).map_err(|e| e.to_string())
}

fn get_branch_info_impl(repo: &Repository) -> Result<BranchInfo> {
    let head = repo.head()?;
    let current = head
        .shorthand()
        .unwrap_or("HEAD")
        .to_string();

    let (ahead, behind) = get_ahead_behind(repo)?;

    // Get upstream name
    let upstream = if let Ok(branch_name) = head.shorthand().ok_or(AppError::InvalidInput("No branch name".to_string())) {
        if let Ok(branch_obj) = repo.find_branch(branch_name, git2::BranchType::Local) {
            if let Ok(upstream_branch) = branch_obj.upstream() {
                if let Some(name) = upstream_branch.name()? {
                    Some(name.to_string())
                } else {
                    None
                }
            } else {
                None
            }
        } else {
            None
        }
    } else {
        None
    };

    Ok(BranchInfo {
        current,
        ahead,
        behind,
        upstream,
    })
}

/// Get commit history for a repository
#[tauri::command]
pub async fn get_commit_history(path: String, limit: usize) -> std::result::Result<Vec<CommitInfo>, String> {
    let repo = Repository::open(&path).map_err(|e| e.to_string())?;
    get_commit_history_impl(&repo, limit).map_err(|e| e.to_string())
}

fn get_commit_history_impl(repo: &Repository, limit: usize) -> Result<Vec<CommitInfo>> {
    let head = repo.head()?;
    let mut revwalk = repo.revwalk()?;
    revwalk.push(head.target().ok_or(AppError::InvalidInput("No head commit".to_string()))?)?;

    let mut commits = Vec::new();

    for (i, oid) in revwalk.enumerate() {
        if i >= limit {
            break;
        }

        let oid = oid?;
        let commit = repo.find_commit(oid)?;

        let timestamp = commit.time().seconds();
        let author = commit.author().name().unwrap_or("Unknown").to_string();
        let message = commit.message().unwrap_or("").to_string();
        let short_id = format!("{:.7}", oid);

        commits.push(CommitInfo {
            id: oid.to_string(),
            short_id,
            message,
            author,
            timestamp,
        });
    }

    Ok(commits)
}
