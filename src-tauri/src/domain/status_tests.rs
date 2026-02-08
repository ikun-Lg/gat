#[cfg(test)]
mod tests {
    use crate::domain::status::{RepoStatus, CommitType, CommitSuggestion};

    #[test]
    fn test_repo_status_initialization() {
        let status = RepoStatus::new();
        assert!(status.staged.is_empty());
        assert!(status.unstaged.is_empty());
        assert!(status.untracked.is_empty());
        assert!(status.conflicted.is_empty());
        assert!(!status.has_changes());
        assert_eq!(status.total_count(), 0);
    }

    #[test]
    fn test_commit_type_as_str() {
        assert_eq!(CommitType::Feat.as_str(), "feat");
        assert_eq!(CommitType::Fix.as_str(), "fix");
        assert_eq!(CommitType::Docs.as_str(), "docs");
    }

    #[test]
    fn test_commit_suggestion_formatting() {
        let suggestion = CommitSuggestion::new(CommitType::Feat, "add new feature");
        assert_eq!(suggestion.formatted, "feat: add new feature");

        let scoped = suggestion.clone().with_scope("ui");
        assert_eq!(scoped.formatted, "feat(ui): add new feature");

        let with_body = scoped.with_body("detailed description");
        assert!(with_body.formatted.contains("feat(ui): add new feature"));
        assert!(with_body.formatted.contains("detailed description"));
    }
}
