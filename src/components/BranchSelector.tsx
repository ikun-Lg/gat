import { useRepoStore } from '../store/repoStore';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { GitBranch, Cloud, Check, Upload, Trash2, Edit3, Copy, GitMerge } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { cn } from '../lib/utils';

import { CreateBranchDialog } from './CreateBranchDialog';
import { RenameBranchDialog } from './RenameBranchDialog';

interface BranchSelectorProps {
  repoPath: string;
}

export function BranchSelector({ repoPath }: BranchSelectorProps) {
  const { 
    currentBranchInfo, 
    localBranches, 
    switchBranch, 
    publishBranch, 
    pushBranch, 
    deleteBranch,
    renameBranch,
    createBranch,
    mergeBranch,
    loadLocalBranches, 
    refreshBranchInfo 
  } = useRepoStore();
  const { gitUsername: savedUsername, gitPassword } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [gitUsername, setGitUsername] = useState<string>(savedUsername || '');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, branch: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [baseBranchForCreate, setBaseBranchForCreate] = useState<string | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [branchToRename, setBranchToRename] = useState<string | null>(null);

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
      setErrorMessage(null);
    } catch (e) {
      const errorStr = String(e);
      console.error('切换分支失败:', e);

      // Check if it's a conflict error with uncommitted changes
      if (errorStr.includes('conflict') || errorStr.includes('冲突') || errorStr.includes('uncommitted') || errorStr.includes('changes')) {
        setErrorMessage(
          '⚠️ 无法切换分支：工作区有未提交的更改\n\n' +
          '建议解决方案：\n' +
          '• 提交更改：先提交当前分支的修改，然后切换\n' +
          '• 贮存更改：使用 Stash 暂时保存更改，切换后再恢复\n' +
          '• 放弃更改：如果确定不需要这些更改，可以放弃它们\n\n' +
          '💡 提示：您可以在左侧文件列表中管理更改'
        );
      } else if (errorStr.includes('merge') || errorStr.includes('rebase')) {
        setErrorMessage(
          '⚠️ 无法切换分支：存在未完成的合并或变基操作\n\n' +
          '请先完成或中止当前的合并/变基操作，然后再切换分支。\n\n' +
          '您可以在"冲突"标签页中查看详细信息。'
        );
      } else {
        setErrorMessage(`切换分支失败: ${errorStr}`);
      }
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

  const handleContextMenu = (e: React.MouseEvent, branchName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, branch: branchName });
  };

  const handleDeleteBranch = async (branchName: string) => {
    try {
      const { ask } = await import('@tauri-apps/plugin-dialog');
      const confirmed = await ask(`确定要删除分支 "${branchName}" 吗？`, {
        title: '删除分支',
        kind: 'warning',
      });
      if (!confirmed) return;

      await deleteBranch(repoPath, branchName);
      setContextMenu(null);
    } catch (e) {
      console.error('删除分支失败:', e);
      setErrorMessage(String(e));
    }
  };

  const handleRenameBranch = (branchName: string) => {
    setBranchToRename(branchName);
    setRenameDialogOpen(true);
    setContextMenu(null);
  };

  const handleRenameConfirm = async (newBranchName: string) => {
    if (branchToRename) {
      try {
        await renameBranch(repoPath, branchToRename, newBranchName);
        setRenameDialogOpen(false);
        setBranchToRename(null);
      } catch (e) {
        console.error('重命名分支失败:', e);
        setErrorMessage(String(e));
        throw e;
      }
    }
  };

  const handleCreateBranchClick = (branchName: string) => {
    setBaseBranchForCreate(branchName);
    setCreateDialogOpen(true);
    setContextMenu(null);
  };

  const handleCreateBranchConfirm = async (newBranchName: string) => {
    if (baseBranchForCreate) {
      await createBranch(repoPath, newBranchName, baseBranchForCreate);
      // Optional: switch to new branch automatically?
      // await switchBranch(repoPath, newBranchName);
    }
  };

  const handleCopyBranchName = (branchName: string) => {
    navigator.clipboard.writeText(branchName);
    setContextMenu(null);
  };

  const handleMergeBranch = async (branchName: string) => {
    try {
      const { ask } = await import('@tauri-apps/plugin-dialog');
      const confirmed = await ask(`确定要将 "${branchName}" 合并到当前分支 "${currentBranch}" 吗？`, {
        title: '合并分支',
        kind: 'warning',
        okLabel: '合并',
        cancelLabel: '取消'
      });
      
      if (!confirmed) return;

      await mergeBranch(repoPath, branchName);
      setContextMenu(null);
      setIsOpen(false);
    } catch (e) {
      console.error('合并分支失败:', e);
      setErrorMessage(String(e));
    }
  };

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                  className={cn(
                    "flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer group transition-all duration-150",
                    branch.isHead && "bg-primary/5"
                  )}
                  onClick={() => handleSwitchBranch(branch.name)}
                  onContextMenu={(e) => handleContextMenu(e, branch.name)}
                >
                  <div className="flex items-center gap-2">
                    {branch.isHead ? (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    ) : (
                      <div className="w-3.5 h-3.5" /> // Spacer
                    )}
                    <span className={cn("text-sm", branch.isHead && "font-semibold text-primary")}>
                      {branch.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {branch.upstream && (
                      <Cloud className="w-3 h-3 text-muted-foreground/60" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-2 mb-2 p-2 bg-destructive/10 border border-destructive/30 rounded-lg">
                <p className="text-xs text-destructive whitespace-pre-line">{errorMessage}</p>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="mt-1 text-xs text-destructive/70 hover:text-destructive underline"
                >
                  关闭
                </button>
              </div>
            )}

            {/* Context Menu Portal (Simplified as overflow-visible container) */}
            {contextMenu && (
              <div 
                ref={menuRef}
                className="fixed z-[100] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl py-1 w-48 animate-in fade-in zoom-in-95 duration-100"
                style={{ left: contextMenu.x, top: contextMenu.y }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800 mb-1">
                  分支: {contextMenu.branch}
                </div>
                
                <button 
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary hover:text-white flex items-center gap-2"
                  onClick={() => handleCreateBranchClick(contextMenu.branch)}
                >
                  <GitBranch className="w-4 h-4" /> 基于此分支新建
                </button>

                {!localBranches.find(b => b.name === contextMenu.branch)?.isHead && (
                  <button 
                    className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary hover:text-white flex items-center gap-2"
                    onClick={() => handleMergeBranch(contextMenu.branch)}
                  >
                    <GitMerge className="w-4 h-4" /> 合并到当前分支
                  </button>
                )}
                
                <button 
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary hover:text-white flex items-center gap-2"
                  onClick={() => handleRenameBranch(contextMenu.branch)}
                >
                  <Edit3 className="w-4 h-4" /> 重命名
                </button>
                
                <button 
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-primary hover:text-white flex items-center gap-2"
                  onClick={() => handleCopyBranchName(contextMenu.branch)}
                >
                  <Copy className="w-4 h-4" /> 复制名称
                </button>
                
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
                
                <button 
                  className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-500 hover:text-white flex items-center gap-2"
                  onClick={() => handleDeleteBranch(contextMenu.branch)}
                >
                  <Trash2 className="w-4 h-4" /> 删除分支
                </button>
              </div>
            )}

            {baseBranchForCreate && (
              <CreateBranchDialog
                isOpen={createDialogOpen}
                baseBranch={baseBranchForCreate}
                onClose={() => {
                  setCreateDialogOpen(false);
                  setBaseBranchForCreate(null);
                }}
                onCreate={handleCreateBranchConfirm}
              />
            )}

            {branchToRename && (
              <RenameBranchDialog
                isOpen={renameDialogOpen}
                currentBranchName={branchToRename}
                onClose={() => {
                  setRenameDialogOpen(false);
                  setBranchToRename(null);
                }}
                onRename={handleRenameConfirm}
              />
            )}

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
