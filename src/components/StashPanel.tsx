import { useRepoStore } from '../store/repoStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Archive, Play, CornerUpLeft, Trash2 } from 'lucide-react';

export const StashPanel: React.FC = () => {
  const { selectedRepoPath, stashes, stashApply, stashPop, stashDrop } = useRepoStore();

  if (!selectedRepoPath) return null;

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-sm border-l border-border/50">
      <div className="p-4 border-b border-border/40 flex items-center gap-2">
        <Archive className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">Stashes</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {stashes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Archive className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">No saved stashes</p>
          </div>
        ) : (
          stashes.map((stash) => (
            <Card key={stash.id} className="p-3 bg-secondary/30 border-border/40 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" title={stash.message}>
                    {stash.message || `Stash @{${stash.index}}`}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-1">
                    {stash.id.slice(0, 7)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:text-primary"
                  onClick={() => stashApply(selectedRepoPath, stash.index)}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:text-primary"
                  onClick={() => stashPop(selectedRepoPath, stash.index)}
                >
                  <CornerUpLeft className="w-3 h-3 mr-1" />
                  Pop
                </Button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs hover:text-destructive text-destructive/70"
                  onClick={() => stashDrop(selectedRepoPath, stash.index)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
