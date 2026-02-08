use thiserror::Error;

#[derive(Debug, Error)]
#[allow(dead_code)]
pub enum AppError {
    #[error("Git error: {0}")]
    Git(#[from] git2::Error),

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Repository not found at {0}")]
    RepoNotFound(String),

    #[error("Nothing to commit")]
    NothingToCommit,

    #[error("Merge conflict detected")]
    MergeConflict,

    #[error("HTTP error: {0}")]
    Http(String),

    #[error("AI API error: {0}")]
    AiApi(String),

    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

impl From<String> for AppError {
    fn from(s: String) -> Self {
        AppError::InvalidInput(s)
    }
}

impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, AppError>;
