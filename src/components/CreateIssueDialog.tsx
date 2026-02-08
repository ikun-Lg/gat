
import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Textarea } from './ui/Textarea';
import { useProviderStore } from '../store/providerStore';
import { Loader2, X, CircleDot } from 'lucide-react';
import { CreateIssue } from '../types';

interface CreateIssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  repoPath: string;
}

export function CreateIssueDialog({ isOpen, onClose, repoPath }: CreateIssueDialogProps) {
  const { createIssue } = useProviderStore();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setBody('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('请填写标题');
      return;
    }

    setIsCreating(true);
    setError(null);

    const issue: CreateIssue = {
      title,
      body,
    };

    try {
      await createIssue(repoPath, issue);
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
                <CircleDot className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">创建 Issue</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isCreating}>
                <X className="w-4 h-4" />
            </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>标题 <span className="text-destructive">*</span></Label>
                <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="简要描述问题..."
                    disabled={isCreating}
                />
            </div>

            <div className="space-y-2">
                <Label>描述</Label>
                <Textarea 
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="详细描述问题内容、复现步骤等..."
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
                        '创建 Issue'
                    )}
                </Button>
            </div>
        </form>
      </Card>
    </div>
  );
}
