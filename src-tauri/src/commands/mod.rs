pub mod repo;
pub mod commit;
pub mod stash;
pub mod clone;
pub mod provider;
pub mod editor;
pub mod extensions;
pub mod logging;
pub mod credentials;
pub mod ssh;
pub mod gpg;

pub use repo::*;
pub use commit::{stage_files, unstage_files, stage_all, unstage_all, discard_files, commit, revoke_latest_commit, batch_commit, generate_commit_message, review_code, apply_patch};
pub use stash::{get_stash_list, stash_save, stash_apply, stash_pop, stash_drop};
pub use clone::clone_repository;
pub use provider::{fetch_pr_list, fetch_issue_list, create_pr, create_issue, fetch_commit_status, fetch_job_logs};
pub use editor::open_in_external_editor;

// Export security-related commands when needed
// pub use logging::{log_operation, get_operation_logs, clear_operation_logs};
// pub use credentials::{save_credential, get_credential, delete_credential, list_credentials};
// pub use ssh::{generate_ssh_key, get_ssh_keys, delete_ssh_key, read_ssh_public_key, SshKeyInfo};
// pub use gpg::{get_gpg_keys, configure_gpg_signing, disable_gpg_signing, GpgKeyInfo};
