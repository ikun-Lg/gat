mod common;
use common::TestRepo;
use git2::Status;

#[test]
fn test_status_workflow() {
    let mut test_repo = TestRepo::new();
    
    // Create a file -> Untracked
    test_repo.write_file("new_file.txt", "content");
    let status = test_repo.repo.statuses(None).unwrap();
    assert_eq!(status.len(), 1);
    let entry = status.get(0).unwrap();
    assert_eq!(entry.path().unwrap(), "new_file.txt");
    assert!(entry.status().contains(Status::WT_NEW));

    // Stage file -> Added
    let mut index = test_repo.repo.index().unwrap();
    index.add_path(std::path::Path::new("new_file.txt")).unwrap();
    index.write().unwrap();
    
    let status = test_repo.repo.statuses(None).unwrap();
    assert_eq!(status.len(), 1);
    let entry = status.get(0).unwrap();
    assert!(entry.status().contains(Status::INDEX_NEW));

    // Commit -> Clean
    test_repo.commit("initial commit");
    let status = test_repo.repo.statuses(None).unwrap();
    assert_eq!(status.len(), 0);

    // Modify file -> Modified
    test_repo.write_file("new_file.txt", "content changed");
    let status = test_repo.repo.statuses(None).unwrap();
    assert_eq!(status.len(), 1);
    let entry = status.get(0).unwrap();
    assert!(entry.status().contains(Status::WT_MODIFIED));
}
