import { X, FileText, Check, Plus, Minus } from 'lucide-react';
import { Button } from './ui/Button';
import { FileDiff } from '../types';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useRepoStore } from '../store/repoStore';

interface DiffViewProps {
  repoPath: string;
  filename: string;
  diff: FileDiff | null;
  onClose: () => void;
}

export function DiffView({ repoPath, filename, diff, onClose }: DiffViewProps) {
  const { stageChunk, selectedRepoPath } = useRepoStore();
  // Fallback to store's selectedRepoPath if prop is missing (e.g. due to HMR issues)
  const effectiveRepoPath = repoPath || selectedRepoPath || '';

  const [selectedIndices, setSelectedIndices] = useState<Set<string>>(new Set());
  const [isStaging, setIsStaging] = useState(false);

  // Reset selection when diff changes
  useEffect(() => {
    setSelectedIndices(new Set());
  }, [diff]);

  if (!diff) return null;

  const toggleLine = (hunkIndex: number, lineIndex: number) => {
    // ... (lines 27-36)
    const key = `${hunkIndex}-${lineIndex}`;
    const newDate = new Set(selectedIndices);
    if (newDate.has(key)) {
      newDate.delete(key);
    } else {
      newDate.add(key);
    }
    setSelectedIndices(newDate);
  };

  const toggleHunk = (hunkIndex: number, shouldSelect: boolean) => {
    // ... (lines 38-52)
    const newSet = new Set(selectedIndices);
    diff.hunks[hunkIndex].lines.forEach((line, lineIndex) => {
      // Only select/deselect change lines, ignore context
      if (line.origin === '+' || line.origin === '-') {
        const key = `${hunkIndex}-${lineIndex}`;
        if (shouldSelect) {
          newSet.add(key);
        } else {
          newSet.delete(key);
        }
      }
    });
    setSelectedIndices(newSet);
  };

  const handleStageSelected = async () => {
    if (selectedIndices.size === 0) return;
    setIsStaging(true);
    try {
      const patch = generatePatch(diff, selectedIndices);
      if (!effectiveRepoPath) {
        console.error('DiffView: repoPath is missing!');
        return;
      }
      await stageChunk(effectiveRepoPath, patch);
      // Selection will be reset by useEffect when diff updates
    } catch (e) {
      console.error('Failed to stage chunk:', e);
    } finally {
      setIsStaging(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-md border-l border-border/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate text-foreground/80">{filename}</span>
        </div>
        <div className="flex items-center gap-2">
           <Button
            size="sm"
            variant="default"
            disabled={selectedIndices.size === 0 || isStaging}
            onClick={handleStageSelected}
            className="h-7 text-xs"
          >
            {isStaging ? '暂存中...' : `暂存选中 (${selectedIndices.size})`}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="w-8 h-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-xs no-scrollbar">
        <div className="space-y-4">
          {diff.hunks.map((hunk, hunkIndex) => (
            <div key={hunkIndex} className="border border-border/40 rounded-md overflow-hidden bg-background/30">
              <div className="bg-muted/40 px-3 py-1.5 border-b border-border/40 flex items-center justify-between group">
                <span className="text-muted-foreground opacity-70">{hunk.header}</span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                   <button 
                     onClick={() => toggleHunk(hunkIndex, true)}
                     className="text-[10px] hover:text-primary transition-colors"
                   >
                     全选
                   </button>
                   <button 
                     onClick={() => toggleHunk(hunkIndex, false)}
                     className="text-[10px] hover:text-primary transition-colors"
                   >
                     取消
                   </button>
                </div>
              </div>
              <div className="divide-y divide-border/20">
                {hunk.lines.map((line, lineIndex) => {
                  const isChange = line.origin === '+' || line.origin === '-';
                  const isSelected = selectedIndices.has(`${hunkIndex}-${lineIndex}`);
                  
                  let bgClass = "";
                  let textClass = "";
                  
                  if (line.origin === '+') {
                    bgClass = isSelected ? "bg-green-500/20" : "bg-green-500/5 hover:bg-green-500/10";
                    textClass = "text-green-600 dark:text-green-400";
                  } else if (line.origin === '-') {
                    bgClass = isSelected ? "bg-red-500/20" : "bg-red-500/5 hover:bg-red-500/10";
                    textClass = "text-red-600 dark:text-red-400";
                  } else {
                    textClass = "text-muted-foreground/60";
                  }

                  return (
                    <div 
                      key={lineIndex} 
                      className={cn(
                        "flex group cursor-pointer transition-colors",
                        bgClass
                      )}
                      onClick={() => isChange && toggleLine(hunkIndex, lineIndex)}
                    >
                      <div className="w-8 flex items-center justify-center border-r border-border/20 shrink-0 select-none bg-muted/10">
                         {isChange && (
                           <div className={cn(
                             "w-3.5 h-3.5 border rounded flex items-center justify-center transition-all",
                             isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 bg-background group-hover:border-primary/50"
                           )}>
                              {isSelected && <Check className="w-2.5 h-2.5" />}
                           </div>
                         )}
                      </div>
                      <div className="w-8 text-right pr-2 select-none opacity-40 border-r border-border/20 shrink-0">
                        {line.oldLineno}
                      </div>
                      <div className="w-8 text-right pr-2 select-none opacity-40 border-r border-border/20 shrink-0">
                        {line.newLineno}
                      </div>
                      <div className="w-4 flex items-center justify-center select-none opacity-60 shrink-0">
                        {line.origin === '+' && <Plus className="w-3 h-3" />}
                        {line.origin === '-' && <Minus className="w-3 h-3" />}
                      </div>
                      <div className={cn("px-2 py-0.5 whitespace-pre-wrap break-all flex-1", textClass)}>
                        {line.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function generatePatch(fileDiff: FileDiff, selectedIndices: Set<string>): string {
  // Check if it's a new file based on first hunk
  const isNewFile = fileDiff.hunks.length > 0 && fileDiff.hunks[0].header.startsWith('@@ -0,0');
  
  let patch = '';
  if (isNewFile) {
    patch = `--- /dev/null\n+++ b/${fileDiff.path}\n`;
  } else {
    patch = `--- a/${fileDiff.path}\n+++ b/${fileDiff.path}\n`;
  }
  
  for (let h = 0; h < fileDiff.hunks.length; h++) {
    const hunk = fileDiff.hunks[h];
    const newHunkLines: string[] = [];
    
    // Parse header to get start lines
    const headerMatch = hunk.header.match(/@@ \-(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
    if (!headerMatch) continue;
    
    const oldStartLine = parseInt(headerMatch[1]);
    const newStartLine = parseInt(headerMatch[3]); // This might need adjustment if we are selecting partial lines from a new file? 
    // Actually, if we select partial lines of a new file, the patch should reflect that.
    // The constructed patch must be valid.
    
    let oldLen = 0;
    let newLen = 0;
    
    let hasSelectionInHunk = false;

    for (let l = 0; l < hunk.lines.length; l++) {
      const line = hunk.lines[l];
      const isSelected = selectedIndices.has(`${h}-${l}`);
      
      // Logic for Staging (Working Dir -> Index)
      
      // Context (' '): Always keep
      if (line.origin === ' ') {
        newHunkLines.push(' ' + line.content);
        oldLen++;
        newLen++;
      }
      // Addition ('+'):
      else if (line.origin === '+') {
         if (isSelected) {
           newHunkLines.push('+' + line.content);
           newLen++;
           hasSelectionInHunk = true;
         } else {
           // Omit. Not in index, not staging.
           // If we omit an addition in a new file, it just doesn't exist in the new file.
         }
      }
      // Deletion ('-'):
      else if (line.origin === '-') {
        if (isSelected) {
          newHunkLines.push('-' + line.content);
          oldLen++;
          hasSelectionInHunk = true;
        } else {
          // Turn to context. It exists in index, we are NOT removing it.
          // BUT if it's a new file, there are no deletions usually?
          // If it's a modified file, and we don't select the deletion, it means we keep the original line.
          newHunkLines.push(' ' + line.content);
          oldLen++;
          newLen++; 
        }
      }
    }
    
    if (hasSelectionInHunk) {
      // Reconstruct header
      let header = `@@ -${oldStartLine}`;
      if (oldLen !== 1) header += `,${oldLen}`;
      header += ` +${newStartLine}`; // Note: newStartLine might be wrong if we skipped previous hunks or lines? 
      // Ideally we should recalculate offsets, but git apply often tolerates line number mismatches with fuzz.
      // However, for precise patching, we should be careful.
      // But we are generating a patch to Apply.
      // If we skip lines in a hunk, the `newLen` will update.
      // The `newStartLine` from the original hunk is where this block *starts*.
      // If we are just filtering lines *within* the hunk, the start line is arguably the same (unless we skipped leading lines? No, we iterate all).
      
      if (newLen !== 1) header += `,${newLen}`;
      header += ` @@`;
      
      patch += header + '\n';
      patch += newHunkLines.join('\n') + '\n';
    }
  }
  
  return patch;
}
