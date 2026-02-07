import { useRepoStore } from '../store/repoStore';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { GitBranch, Cloud, Check, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface BranchSelectorProps {
  repoPath: string;
}

export function BranchSelector({ repoPath }: BranchSelectorProps) {
  const { currentBranchInfo, localBranches, switchBranch, publishBranch, pushBranch, loadLocalBranches, refreshBranchInfo } = useRepoStore();
  const { gitUsername: savedUsername, gitPassword } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const currentBranch = currentBranchInfo?.current || '';
  const isPublished = currentBranchInfo?.isPublished ?? false;
  const needPush = currentBranchInfo?.needPush ?? false;

  const handleSwitchBranch = async (branchName: string) => {
    try {
      await switchBranch(repoPath, branchName);
      setIsOpen(false);
    } catch (e) {
      console.error('切换分支失败:', e);
    }
  };

  const handlePublish = async () => {
    if (!gitPassword) {
      setErrorMessage('请先在设置中配置 Git Token');
      return;
    }
    if (!gitUsername) {
      setErrorMessage('请先在设置中配置 Git 用户名');
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);
    try {
      await publishBranch(
        repoPath,
        currentBranch,
        'origin',
        gitUsername,
        gitPassword
      );
      await refreshBranchInfo(repoPath);
      setIsOpen(false);
    } catch (e) {
      console.error('发布分支失败:', e);
      setErrorMessage(String(e));
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePush = async () => {
    if (!gitPassword) {
      setErrorMessage('请先在设置中配置 Git Token');
      return;
    }
    if (!gitUsername) {
      setErrorMessage('请先在设置中配置 Git 用户名');
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);
    try {
      await pushBranch(
        repoPath,
        currentBranch,
        'origin',
        gitUsername,
        gitPassword
      );
      await refreshBranchInfo(repoPath);
      setIsOpen(false);
    } catch (e) {
      console.error('推送失败:', e);
      setErrorMessage(String(e));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleOpen = () => {
    loadLocalBranches(repoPath);
    setIsOpen(true);
    setErrorMessage(null);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleOpen}
        className="gap-2"
      >
        <GitBranch className="w-4 h-4" />
        <span>{currentBranch}</span>
        {needPush && currentBranch && (
          <span className="text-xs text-amber-500">↑{currentBranchInfo?.ahead || 0}</span>
        )}
        {!isPublished && currentBranch && (
          <span className="text-xs text-muted-foreground">(未发布)</span>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute z-20 top-full mt-1 w-64 max-h-80 overflow-y-auto">
            <div className="p-2 space-y-1">
              {localBranches.map((branch) => (
                <div
                  key={branch.name}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer group"
                  onClick={() => handleSwitchBranch(branch.name)}
                >
                  <div className="flex items-center gap-2">
                    {branch.isHead && <Check className="w-4 h-4 text-primary" />}
                    <span className="text-sm">{branch.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {branch.upstream && (
                      <Cloud className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 操作按钮区域 */}
            {(needPush || !isPublished) && currentBranch && (
              <div className="border-t p-2 space-y-2">
                {needPush && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePush();
                    }}
                    disabled={isPublishing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isPublishing ? '推送中...' : `推送提交 (${currentBranchInfo?.ahead || 0})`}
                  </Button>
                )}
                {!isPublished && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-start"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePublish();
                    }}
                    disabled={isPublishing}
                  >
                    <Cloud className="w-4 h-4 mr-2" />
                    {isPublishing ? '发布中...' : '发布分支'}
                  </Button>
                )}
                {errorMessage && (
                  <p className="text-xs text-red-500">{errorMessage}</p>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
