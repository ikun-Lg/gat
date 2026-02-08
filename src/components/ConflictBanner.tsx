import { AlertTriangle } from 'lucide-react';
import { useRepoStore } from '../store/repoStore';
import { Button } from './ui/Button';

interface ConflictBannerProps {
  onResolve: () => void;
}

export function ConflictBanner({ onResolve }: Omit<ConflictBannerProps, 'repoPath'>) {
  const { mergeState } = useRepoStore();

  if (!mergeState || !mergeState.isMergeInProgress || mergeState.conflictCount === 0) {
    return null;
  }

  return (
    <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center justify-between animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3">
        <div className="p-1.5 bg-destructive/20 rounded-full">
            <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <div className="flex flex-col">
            <span className="text-sm font-medium text-destructive">
                检测到 {mergeState.conflictCount} 个合并冲突
            </span>
            <span className="text-xs text-destructive/80">
                请解决冲突以继续合并操作
            </span>
        </div>
      </div>
      
      <Button 
        size="sm" 
        variant="destructive" 
        className="h-8 shadow-sm"
        onClick={onResolve}
      >
        去解决
      </Button>
    </div>
  );
}
