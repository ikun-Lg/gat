import { cn } from '../lib/utils';
import { GitBranch } from 'lucide-react';
import type { Repository } from '../types';

interface RepoListItemProps {
  repo: Repository;
  isSelected: boolean;
  onClick: () => void;
}

export function RepoListItem({
  repo,
  isSelected,
  onClick,
}: RepoListItemProps) {
  // macOS style selection: Blue background with white text when selected
  // However, for this app's "light/dark" theme compatibility, we'll use a sophisticated tint
  
  return (
    <div
      className={cn(
        'group flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-default transition-all duration-200 select-none',
        // Hover state
        'hover:bg-accent/40',
        // Selected state - similar to macOS Finder sidebar selection
        isSelected && 'bg-accent text-accent-foreground shadow-sm font-medium'
      )}
      onClick={onClick}
    >
      {/* Checkbox removed as per user request */}

      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "truncate text-[13px] tracking-tight",
            isSelected ? "text-accent-foreground" : "text-foreground/90"
          )}>{repo.name}</span>
          
          {/* Status Indicators */}
          {(repo.ahead > 0 || repo.behind > 0) && (
            <div className="flex items-center gap-1 text-[10px] font-bold opacity-80">
              {repo.ahead > 0 && <span className={cn(isSelected ? "text-accent-foreground" : "text-primary")}>↑{repo.ahead}</span>}
              {repo.behind > 0 && <span className={cn(isSelected ? "text-accent-foreground" : "text-destructive")}>↓{repo.behind}</span>}
            </div>
          )}
        </div>

        {/* Sub-row for branch and changes */}
        <div className="flex items-center justify-between text-[11px] opacity-70">
           {repo.branch && (
            <div className="flex items-center gap-1 min-w-0">
              <GitBranch className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{repo.branch}</span>
            </div>
          )}
          
          {repo.hasChanges && (
             <div className="flex items-center gap-1 ml-auto font-medium">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full", 
                  isSelected ? "bg-white" : "bg-amber-500"
                )} />
                <span>{repo.stagedCount + repo.unstagedCount + repo.untrackedCount}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
