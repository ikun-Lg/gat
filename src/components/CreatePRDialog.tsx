
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { useRepoStore } from '../store/repoStore';
import { useProviderStore } from '../store/providerStore';
import { Loader2, X, GitPullRequest, ArrowRight } from 'lucide-react';
import { CreatePullRequest } from '../types';

interface CreatePRDialogProps {
  isOpen: boolean;
  onClose: () => void;
  repoPath: string;
}

export function CreatePRDialog({ isOpen, onClose, repoPath }: CreatePRDialogProps) {
  const { currentBranchInfo, loadRemoteBranches } = useRepoStore();
  const { createPullRequest } = useProviderStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [headBranch, setHeadBranch] = useState('');
  const [baseBranch, setBaseBranch] = useState('main'); // Default to main, but should probably be smart
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when opening
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setBody('');
      setError(null);
      // Set head branch to current branch
      if (currentBranchInfo?.current) {
        setHeadBranch(currentBranchInfo.current);
      }
      // Load remote branches to populate base branch options? 
      // For now just free text or simple selection if possible. 
      // Remote branches are like "origin/main". We need "main".
      loadRemoteBranches(repoPath);
    }
  }, [isOpen, repoPath, currentBranchInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !headBranch.trim() || !baseBranch.trim()) {
      setError('请填写必填字段');
      return;
    }

    setIsCreating(true);
    setError(null);

    const pr: CreatePullRequest = {
      title,
      body,
      head: headBranch,
      base: baseBranch,
    };

    try {
      await createPullRequest(repoPath, pr);
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
      <Card className="w-full max-w-lg p-6 shadow-2xl border-white/20 bg-background/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                <GitPullRequest className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">创建 Pull Request</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isCreating}>
                <X className="w-4 h-4" />
            </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Branch Selection */}
            <div className="grid grid-cols-[1fr,auto,1fr] gap-2 items-end p-4 bg-muted/30 rounded-lg border border-border/50">
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">源分支 (Source)</Label>
                    <div className="text-sm font-medium bg-background px-3 py-2 rounded-md border text-center truncate" title={headBranch}>
                        {headBranch}
                    </div>
                </div>
                
                <div className="pb-3 text-muted-foreground">
                    <ArrowRight className="w-4 h-4" />
                </div>

                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">目标分支 (Target)</Label>
                    <Input 
                        value={baseBranch}
                        onChange={(e) => setBaseBranch(e.target.value)}
                        className="h-9 min-w-0"
                        placeholder="main"
                        disabled={isCreating}
                    />
                     {/* Could be a Select if we had robust remote branch list */}
                </div>
            </div>

            <div className="space-y-2">
                <Label>标题 <span className="text-destructive">*</span></Label>
                <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="简要描述您的更改..."
                    disabled={isCreating}
                />
            </div>

            <div className="space-y-2">
                <Label>描述</Label>
                <Textarea 
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="详细描述更改内容、原因及相关连接..."
                    className="min-h-[120px] resize-none"
                    disabled={isCreating}
                />
            </div>

            {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 shrink-0" />
                    <span className="flex-1">{error}</span>
                </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={isCreating}>
                    取消
                </Button>
                <Button type="submit" disabled={isCreating || !title.trim()}>
                    {isCreating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            创建中...
                        </>
                    ) : (
                        '创建 Pull Request'
                    )}
                </Button>
            </div>
        </form>
      </Card>
    </div>
  );
}
