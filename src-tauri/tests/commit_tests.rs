mod common;
use common::TestRepo;

#[test]
fn test_commit_history() {
    let test_repo = TestRepo::new();
    let repo_path = test_repo.path();
    
    // Create initial commit
    test_repo.write_file("file1.txt", "content 1");
    let mut index = test_repo.repo.index().unwrap();
    index.add_path(std::path::Path::new("file1.txt")).unwrap();
    index.write().unwrap();
    test_repo.commit("feat: initial commit");
    
    // Create second commit
    test_repo.write_file("file2.txt", "content 2");
    let mut index = test_repo.repo.index().unwrap();
    index.add_path(std::path::Path::new("file2.txt")).unwrap();
    index.write().unwrap();
    test_repo.commit("fix: bug fix");
    
    // Verify log
    let mut revwalk = test_repo.repo.revwalk().unwrap();
    revwalk.push_head().unwrap();
    let commits: Vec<_> = revwalk.collect::<Result<Vec<_>, _>>().unwrap();
    
    assert_eq!(commits.len(), 2);
    
    let head = test_repo.repo.head().unwrap().peel_to_commit().unwrap();
    assert_eq!(head.message().unwrap(), "fix: bug fix");
    assert_eq!(head.parent_count(), 1);
}
