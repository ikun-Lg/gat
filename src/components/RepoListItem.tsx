import { Checkbox } from './ui/Checkbox';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';
import { GitBranch, GitCommit, AlertCircle } from 'lucide-react';
import type { Repository } from '../types';

interface RepoListItemProps {
  repo: Repository;
  isSelected: boolean;
  isBatchSelected: boolean;
  onClick: () => void;
  onToggle: (e: React.MouseEvent) => void;
}

export function RepoListItem({
  repo,
  isSelected,
  isBatchSelected,
  onClick,
  onToggle,
}: RepoListItemProps) {
  const statusColor = repo.hasChanges ? 'text-amber-500' : 'text-green-500';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-accent/50',
        isSelected && 'bg-accent'
      )}
      onClick={onClick}
    >
      <Checkbox checked={isBatchSelected} onToggle={onToggle} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{repo.name}</span>
          {repo.hasChanges && (
            <Badge variant="destructive" className="text-xs">
              {repo.stagedCount + repo.unstagedCount + repo.untrackedCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {repo.branch && (
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              {repo.branch}
            </span>
          )}
          {(repo.ahead > 0 || repo.behind > 0) && (
            <span className="text-xs">
              {repo.ahead > 0 && `↑${repo.ahead}`}
              {repo.ahead > 0 && repo.behind > 0 && ' '}
              {repo.behind > 0 && `↓${repo.behind}`}
            </span>
          )}
        </div>
      </div>

      {repo.hasChanges ? (
        <AlertCircle className={cn('w-5 h-5 flex-shrink-0', statusColor)} />
      ) : (
        <GitCommit className={cn('w-5 h-5 flex-shrink-0', statusColor)} />
      )}
    </div>
  );
}
