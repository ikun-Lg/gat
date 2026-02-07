import { X, FileText } from 'lucide-react';
import { Button } from './ui/Button';

interface DiffViewProps {
  filename: string;
  diff: string | null;
  onClose: () => void;
}

export function DiffView({ filename, diff, onClose }: DiffViewProps) {
  if (!diff) return null;

  const lines = diff.split('\n');

  return (
    <div className="flex flex-col h-full bg-card/30 backdrop-blur-md border-l border-border/50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-medium truncate text-foreground/80">{filename}</span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="w-8 h-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-xs no-scrollbar">
        <div className="space-y-[1px]">
          {lines.map((line, i) => {
            let className = "px-2 py-[2px] rounded-sm whitespace-pre-wrap break-all";
            if (line.startsWith('+')) {
              className += " bg-green-500/10 text-green-500/90";
            } else if (line.startsWith('-')) {
              className += " bg-red-500/10 text-red-500/90";
            } else if (line.startsWith('@@')) {
              className += " text-blue-400/80 bg-blue-500/5 my-2 font-bold py-1";
            } else {
              className += " text-muted-foreground/70";
            }

            return (
              <div key={i} className={className}>
                {line}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
