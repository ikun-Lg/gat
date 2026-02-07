import { useRepoStore } from '../store/repoStore';
import { RepoListItem } from './RepoListItem';
import { Button } from './ui/Button';
import { RefreshCw, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface RepoListProps {
  onScanClick: () => void;
}

export function RepoList({ onScanClick }: RepoListProps) {
  const { repositories, selectedRepoPath, selectedRepoPaths, selectRepo, toggleRepoSelection } = useRepoStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    for (const repo of repositories) {
      await useRepoStore.getState().refreshStatus(repo.path);
      await useRepoStore.getState().refreshBranchInfo(repo.path);
    }
    setIsRefreshing(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">仓库列表</h2>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing || repositories.length === 0}
            title="全部刷新"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          </Button>
          <Button size="icon" variant="ghost" onClick={onScanClick} title="扫描目录">
            <FolderOpen className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {repositories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
            <FolderOpen className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">未找到仓库</p>
            <p className="text-xs mt-1">点击文件夹图标扫描目录</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {repositories.map((repo) => (
              <RepoListItem
                key={repo.path}
                repo={repo}
                isSelected={selectedRepoPath === repo.path}
                isBatchSelected={selectedRepoPaths.has(repo.path)}
                onClick={() => selectRepo(repo.path)}
                onToggle={(e) => {
                  e.stopPropagation();
                  toggleRepoSelection(repo.path);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {repositories.length > 0 && (
        <div className="p-4 border-t text-xs text-muted-foreground">
          {repositories.length} 个仓库
        </div>
      )}
    </div>
  );
}
