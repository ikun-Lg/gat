use std::path::PathBuf;
use tempfile::TempDir;
use git2::{Repository, Signature};

pub struct TestRepo {
    pub repo: Repository,
    pub dir: TempDir,
}

impl TestRepo {
    pub fn new() -> Self {
        let dir = TempDir::new().expect("Failed to create temp dir");
        let repo = Repository::init(dir.path()).expect("Failed to init repo");
        
        // Configure user for commits
        let mut config = repo.config().expect("Failed to get config");
        config.set_str("user.name", "Test User").unwrap();
        config.set_str("user.email", "test@example.com").unwrap();
        config.set_bool("core.logallrefupdates", false).unwrap();

        Self { repo, dir }
    }

    pub fn path(&self) -> String {
        self.dir.path().to_string_lossy().to_string()
    }

    pub fn commit(&self, message: &str) -> git2::Oid {
        let mut index = self.repo.index().unwrap();
        let tree_id = index.write_tree().unwrap();
        let tree = self.repo.find_tree(tree_id).unwrap();

        let sig = Signature::now("Test User", "test@example.com").unwrap();
        
        let parent_commit = match self.repo.head() {
            Ok(head) => {
                let target = head.target().unwrap();
                vec![self.repo.find_commit(target).unwrap()]
            },
            Err(_) => vec![],
        };

        let parents: Vec<&git2::Commit> = parent_commit.iter().collect();

        self.repo.commit(
            Some("HEAD"),
            &sig,
            &sig,
            message,
            &tree,
            &parents,
        ).unwrap()
    }

    pub fn write_file(&self, path: &str, content: &str) -> PathBuf {
        let file_path = self.dir.path().join(path);
        std::fs::write(&file_path, content).expect("Failed to write file");
        file_path
    }
}
