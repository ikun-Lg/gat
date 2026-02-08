mod common;
use common::TestRepo;

#[test]
#[ignore]
fn test_stash_operations() {
    let mut test_repo = TestRepo::new();
    
    // Initial commit
    test_repo.write_file("file.txt", "initial");
    let mut index = test_repo.repo.index().unwrap();
    index.add_path(std::path::Path::new("file.txt")).unwrap();
    index.write().unwrap();
    test_repo.commit("initial");

    // Modify file
    test_repo.write_file("file.txt", "modified");
    
    // Stash
    let signature = test_repo.repo.signature().unwrap();
    test_repo.repo.stash_save(&signature, "test stash", None).unwrap();
    
    // Verify working directory is clean (back to initial)
    let content = std::fs::read_to_string(test_repo.dir.path().join("file.txt")).unwrap();
    assert_eq!(content, "initial");
    
    // Verify stash list
    let mut stash_count = 0;
    test_repo.repo.stash_foreach(|_, _, _| {
        stash_count += 1;
        true
    }).unwrap();
    assert_eq!(stash_count, 1);
    
    // Apply (pop) stash
    test_repo.repo.stash_pop(0, None).unwrap();
    let content_restored = std::fs::read_to_string(test_repo.dir.path().join("file.txt")).unwrap();
    assert_eq!(content_restored, "modified");
}
