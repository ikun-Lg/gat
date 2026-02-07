import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { useRepoStore } from '../store/repoStore';
import { Loader2, X, Plus, Trash2, Edit2, Globe } from 'lucide-react';
import { RemoteInfo } from '../types';

interface RemoteManagementDialogProps {
  onClose: () => void;
  isOpen: boolean;
  repoPath: string;
}

export function RemoteManagementDialog({ onClose, isOpen, repoPath }: RemoteManagementDialogProps) {
  const { remotes, loadRemotes, addRemote, removeRemote, renameRemote, setRemoteUrl } = useRepoStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Edit/Add state
  const [editingRemote, setEditingRemote] = useState<RemoteInfo | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadRemotes(repoPath);
    }
  }, [isOpen, repoPath, loadRemotes]);

  const handleClose = () => {
    setEditingRemote(null);
    setIsAdding(false);
    setName('');
    setUrl('');
    setError(null);
    onClose();
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingRemote(null);
    setName('');
    setUrl('');
    setError(null);
  };

  const startEdit = (remote: RemoteInfo) => {
    setEditingRemote(remote);
    setIsAdding(false);
    setName(remote.name);
    setUrl(remote.url || '');
    setError(null);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingRemote(null);
    setName('');
    setUrl('');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!name || !url) {
      setError('名称和 URL 不能为空');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isAdding) {
        await addRemote(repoPath, name, url);
      } else if (editingRemote) {
        if (editingRemote.name !== name) {
            await renameRemote(repoPath, editingRemote.name, name);
        }
        if (editingRemote.url !== url) {
            await setRemoteUrl(repoPath, name, url);
        }
      }
      cancelEdit();
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (remoteName: string) => {
    // In a real app, maybe show a confirmation dialog here
    if (!confirm(`确定要删除远程仓库 "${remoteName}" 吗？`)) return;

    setIsLoading(true);
    try {
      await removeRemote(repoPath, remoteName);
    } catch (e) {
      setError(String(e));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 relative">
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2"
            onClick={handleClose}
            disabled={isLoading}
        >
            <X className="w-4 h-4" />
        </Button>
        
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            远程仓库管理
        </h2>
        
        {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mb-4">
              {error}
            </div>
        )}

        <div className="space-y-4">
            {/* List Mode */}
            {!isAdding && !editingRemote && (
                <>
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                        {remotes.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8">
                                暂无远程仓库
                            </div>
                        ) : (
                            remotes.map(remote => (
                                <div key={remote.name} className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors">
                                    <div className="min-w-0 flex-1 mr-4">
                                        <div className="font-medium flex items-center gap-2">
                                            {remote.name}
                                            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">FETCH</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate" title={remote.url || ''}>
                                            {remote.url || 'No URL'}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(remote)}>
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(remote.name)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    <Button onClick={startAdd} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        添加远程仓库
                    </Button>
                </>
            )}

            {/* Add/Edit Mode */}
            {(isAdding || editingRemote) && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="space-y-2">
                        <Label htmlFor="name">名称</Label>
                        <Input 
                            id="name" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="origin"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input 
                            id="url" 
                            value={url} 
                            onChange={e => setUrl(e.target.value)} 
                            placeholder="https://..."
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={cancelEdit} disabled={isLoading}>
                            取消
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isAdding ? '添加' : '保存'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </Card>
    </div>
  );
}
