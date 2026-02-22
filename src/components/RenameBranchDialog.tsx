import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { GitBranch } from 'lucide-react';

interface RenameBranchDialogProps {
  isOpen: boolean;
  currentBranchName: string;
  onClose: () => void;
  onRename: (newBranchName: string) => Promise<void>;
}

export function RenameBranchDialog({ isOpen, currentBranchName, onClose, onRename }: RenameBranchDialogProps) {
  const [branchName, setBranchName] = useState(currentBranchName);
  const [isRenaming, setIsRenaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBranchName(currentBranchName);
      setError(null);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, currentBranchName]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!branchName.trim()) {
      setError('请输入分支名称');
      return;
    }

    if (branchName.trim() === currentBranchName) {
      onClose();
      return;
    }

    setIsRenaming(true);
    setError(null);

    try {
      await onRename(branchName.trim());
      onClose();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsRenaming(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
      <Card className="w-full max-w-sm p-6 shadow-2xl border-white/20 bg-background/95 backdrop-blur-xl">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GitBranch className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">重命名分支</h2>
          </div>
          
          <p className="text-sm text-muted-foreground">
            重命名分支 <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">{currentBranchName}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={branchName}
                  onChange={(e) => {
                    setBranchName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="输入新分支名称..."
                  className="h-10 bg-background/50"
                  disabled={isRenaming}
                />
              </div>
              
              {error && (
                <p className="text-xs text-destructive font-medium animate-in slide-in-from-top-1">
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isRenaming}
                className="hover:bg-muted"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={!branchName.trim() || isRenaming}
              >
                {isRenaming ? '重命名中...' : '重命名'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
