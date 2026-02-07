import { useRepoStore } from '../store/repoStore';
import { useSettingsStore } from '../store/settingsStore';
import { FileList } from './FileList';
import { CommitPanel } from './CommitPanel';
import { BranchSelector } from './BranchSelector';
import { AlertCircle, Upload } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface RepoViewProps {
  repoPath: string;
}

export function RepoView({ repoPath }: RepoViewProps) {
  const { repositories, pushBranch, refreshBranchInfo, currentBranchInfo } = useRepoStore();
  const { gitUsername: savedUsername, gitPassword } = useSettingsStore();
  const repo = repositories.find((r) => r.path === repoPath);
  const [isPushing, setIsPushing] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [gitUsername, setGitUsername] = useState<string>(savedUsername || '');

  // Load git username from config if not saved
  useEffect(() => {
    if (!savedUsername) {
      invoke<string | null>('get_git_username', { path: repoPath })
        .then(name => {
          if (name) setGitUsername(name);
        })
        .catch(() => {});
    } else {
      setGitUsername(savedUsername);
    }
  }, [repoPath, savedUsername]);

  if (!repo) return null;

  const needPush = (currentBranchInfo?.needPush ?? false) || repo.ahead > 0;
  const currentBranch = currentBranchInfo?.current || repo.branch || '';

  const handlePush = async () => {
    if (!gitPassword) {
      setPushError('请先在设置中配置 Git Token');
      return;
    }
    if (!gitUsername) {
      setPushError('请先在设置中配置 Git 用户名');
      return;
    }

    setIsPushing(true);
    setPushError(null);
    try {
      await pushBranch(
        repoPath,
        currentBranch,
        'origin',
        gitUsername,
        gitPassword
      );
      await refreshBranchInfo(repoPath);
    } catch (e) {
      console.error('推送失败:', e);
      setPushError(String(e));
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-xl font-semibold">{repo.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <BranchSelector repoPath={repoPath} />
            {(repo.ahead > 0 || repo.behind > 0) && (
              <Badge variant="outline" className="text-xs">
                {repo.ahead > 0 && `↑${repo.ahead} `}
                {repo.behind > 0 && `↓${repo.behind}`}
              </Badge>
            )}
            {repo.hasChanges && (
              <span className="flex items-center gap-1 text-amber-500">
                <AlertCircle className="w-3 h-3" />
                未提交的更改
              </span>
            )}
          </div>
        </div>
        {needPush && (
          <div className="flex items-center gap-2">
            {pushError && (
              <span className="text-xs text-red-500">{pushError}</span>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handlePush}
              disabled={isPushing}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isPushing ? '推送中...' : `推送 (${currentBranchInfo?.ahead || repo.ahead})`}
            </Button>
          </div>
        )}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        <FileList repoPath={repoPath} />
      </div>

      {/* Commit panel */}
      <CommitPanel repoPath={repoPath} mode="single" />
    </div>
  );
}
