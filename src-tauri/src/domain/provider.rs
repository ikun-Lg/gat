use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use crate::error::Result;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct PullRequest {
    pub id: String,
    pub number: u64,
    pub title: String,
    pub body: Option<String>,
    pub state: String, // "open", "closed", "merged"
    pub author: String,
    pub created_at: String,
    pub updated_at: String,
    pub url: String,
    pub head_ref: String, // branch name
    pub base_ref: String, // branch name
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePullRequest {
    pub title: String,
    pub body: Option<String>,
    pub head: String,
    pub base: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Issue {
    pub id: String,
    pub number: u64,
    pub title: String,
    pub body: Option<String>,
    pub state: String, // "open", "closed"
    pub author: String,
    pub created_at: String,
    pub updated_at: String,
    pub url: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateIssue {
    pub title: String,
    pub body: Option<String>,
}

#[async_trait]
pub trait GitProvider: Send + Sync {
    async fn get_pr_list(&self, owner: &str, repo: &str) -> Result<Vec<PullRequest>>;
    async fn get_issue_list(&self, owner: &str, repo: &str) -> Result<Vec<Issue>>;
    async fn create_pr(&self, owner: &str, repo: &str, pr: CreatePullRequest) -> Result<PullRequest>;
    async fn create_issue(&self, owner: &str, repo: &str, issue: CreateIssue) -> Result<Issue>;
}
