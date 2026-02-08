mod common;
use common::TestRepo;

#[test]
fn test_get_repo_info() {
    let test_repo = TestRepo::new();
    let _repo_path = test_repo.path();

    // Ideally we would test the actual Tauri command here, but since it requires Tauri context, 
    // we might need to refactor commands to be testable without the full Tauri runtime 
    // or test the underlying logic if extracted.
    
    // For now, let's test basic git operations via our helper to ensure environment is sane
    // and simulate what the command would do.
    
    let repo = &test_repo.repo;
    assert!(!repo.is_bare());
    assert!(repo.head().is_err()); // No commits yet
}

#[test]
fn test_commit_flow() {
    let test_repo = TestRepo::new();
    test_repo.write_file("test.txt", "hello world");
    
    // Stage file
    let mut index = test_repo.repo.index().unwrap();
    index.add_path(std::path::Path::new("test.txt")).unwrap();
    index.write().unwrap();

    // Commit
    let commit_id = test_repo.commit("Initial commit");
    
    let head_commit = test_repo.repo.head().unwrap().peel_to_commit().unwrap();
    assert_eq!(head_commit.id(), commit_id);
    assert_eq!(head_commit.message().unwrap(), "Initial commit");
}
