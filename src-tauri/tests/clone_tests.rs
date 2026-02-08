mod common;
use common::TestRepo;
use git2::Repository;
use tempfile::TempDir;

#[test]
#[ignore]
fn test_clone() {
    let source_repo = TestRepo::new();
    source_repo.write_file("README.md", "Clone me");
    let mut index = source_repo.repo.index().unwrap();
    index.add_path(std::path::Path::new("README.md")).unwrap();
    index.write().unwrap();
    source_repo.commit("Initial commit");

    let dest_dir = TempDir::new().unwrap();
    let dest_path = dest_dir.path();

    // Perform clone
    let cloned_repo = Repository::clone(&source_repo.path(), dest_path).unwrap();
    assert!(!cloned_repo.is_bare());
    
    // Verify content
    let readme_path = dest_path.join("README.md");
    let content = std::fs::read_to_string(readme_path).unwrap();
    assert_eq!(content, "Clone me");
}
