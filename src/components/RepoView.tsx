import { useRepoStore } from '../store/repoStore';
import { useSettingsStore } from '../store/settingsStore';
import { FileList } from './FileList';
import { CommitPanel } from './CommitPanel';
import { BranchSelector } from './BranchSelector';
import { AlertCircle, Upload, RotateCcw } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { cn } from '../lib/utils';

interface RepoViewProps {
  repoPath: string;
}

export function RepoView({ repoPath }: RepoViewProps) {
  const { repositories, pushBranch, refreshBranchInfo, currentBranchInfo, revokeLatestCommit } = useRepoStore();
  const { gitUsername: savedUsername, gitPassword } = useSettingsStore();
  const repo = repositories.find((r) => r.path === repoPath);
  const [isPushing, setIsPushing] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
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
      // 触发屏幕晃动反馈
      const element = document.getElementById('repo-view-container');
      if (element) {
        element.classList.remove('animate-shake');
        void element.offsetWidth; // trigger reflow
        element.classList.add('animate-shake');
      }
    } finally {
      setIsPushing(false);
    }
  };

  const handleRevoke = async () => {
    try {
      const { ask } = await import('@tauri-apps/plugin-dialog');
      const confirmed = await ask('确定要撤回最后一次提交吗？\n\n此操作将撤销最后一次提交，但保留所有更改在暂存区中。', {
        title: '确认撤回提交',
        kind: 'warning',
        okLabel: '撤回',
        cancelLabel: '取消'
      });
      
      if (!confirmed) return;
    
      setIsRevoking(true);
      await revokeLatestCommit(repoPath);
    } catch (e) {
      console.error('撤回失败:', e);
      setPushError(String(e));
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div id="repo-view-container" className="flex flex-col h-full bg-background/50">
      {/* Header - macOS style toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-glass/50 shrink-0 z-10">
        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{repo.name}</h1>
            <BranchSelector repoPath={repoPath} />
           </div>
           
           <div className="flex items-center gap-2">
            {(repo.ahead > 0 || repo.behind > 0) && (
              <Badge variant="outline" className="h-5 text-[10px] font-medium border-primary/30 text-primary px-1.5 rounded bg-primary/5">
                {repo.ahead > 0 && `↑${repo.ahead} `}
                {repo.behind > 0 && `↓${repo.behind}`}
              </Badge>
            )}
            {repo.hasChanges && (
              <Badge variant="secondary" className="h-5 text-[10px] font-medium bg-amber-500/10 text-amber-600 border-amber-500/20 px-1.5 rounded gap-1">
                <AlertCircle className="w-3 h-3" />
                未提交的修改
              </Badge>
            )}
           </div>
        </div>
        
        <div className="flex items-center gap-3">
          {pushError && (
            <span className="text-xs font-medium text-destructive bg-destructive/10 px-3 py-1.5 rounded-lg animate-shake">{pushError}</span>
          )}
          
          {(needPush || true) && ( /* Always show for design check, logic remains */
             <div className="flex items-center gap-2">
                {/* Only show revoke if needed (logic from original code preserved) */}
                {needPush && ( 
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRevoke}
                    disabled={isRevoking || isPushing}
                    className="h-8 shadow-sm hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30 transition-all btn-tactile"
                    title="撤销上次提交"
                  >
                    <RotateCcw className={cn("w-3.5 h-3.5", isRevoking && "animate-spin")} style={{ animationDirection: 'reverse' }} />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant="default"
                  onClick={handlePush}
                  disabled={isPushing || isRevoking || !needPush}
                  className={cn(
                    "h-8 shadow-sm transition-all btn-tactile font-medium px-4",
                    needPush ? "opacity-100" : "opacity-50 grayscale"
                  )}
                >
                  <Upload className={cn("w-3.5 h-3.5 mr-2", isPushing && "animate-pulse")} />
                  {isPushing ? '推送中...' : '提交推送'}
                </Button>
             </div>
          )}
        </div>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        <FileList repoPath={repoPath} />
      </div>

      {/* Commit panel */}
      <div className="shrink-0 z-20">
        <CommitPanel repoPath={repoPath} mode="single" />
      </div>
    </div>
  );
}
