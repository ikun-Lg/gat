import { useRepoStore } from '../store/repoStore';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';
import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface CommitPanelProps {
  repoPath: string | string[];
  mode: 'single' | 'batch';
}

export function CommitPanel({ repoPath, mode }: CommitPanelProps) {
  const { currentStatus, commit, batchCommit, generateCommitMessage } = useRepoStore();
  const { commitLanguage } = useSettingsStore();
  const [message, setMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const hasStaged = currentStatus && currentStatus.staged.length > 0;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const paths = Array.isArray(repoPath) ? repoPath : [repoPath];
      const path = paths[0];
      const suggestion = await generateCommitMessage(path);
      setMessage(suggestion.formatted);
    } catch (e) {
      console.error('生成消息失败:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCommit = async () => {
    if (!message.trim()) return;

    setIsCommitting(true);
    try {
      if (mode === 'single') {
        await commit(repoPath as string, message);
      } else {
        await batchCommit(repoPath as string[], message);
      }
      setMessage('');
    } catch (e) {
      console.error('提交失败:', e);
    } finally {
      setIsCommitting(false);
    }
  };

  const getPlaceholder = () => {
    if (commitLanguage === 'zh') {
      return 'feat: 添加新功能';
    }
    return 'feat: add new feature';
  };

  return (
    <Card className="m-4">
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Commit 消息</label>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating || !hasStaged}
            >
              <Sparkles className="w-4 h-4 mr-1" />
              {isGenerating ? '生成中...' : 'AI 生成'}
            </Button>
          </div>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={getPlaceholder()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleCommit();
              }
            }}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleCommit}
          disabled={!hasStaged || !message.trim() || isCommitting}
        >
          <Check className="w-4 h-4 mr-2" />
          {isCommitting
            ? '提交中...'
            : mode === 'single'
            ? '提交更改'
            : `提交 ${Array.isArray(repoPath) ? repoPath.length : 1} 个仓库`}
        </Button>

        {currentStatus && (
          <div className="text-xs text-muted-foreground text-center">
            {currentStatus.staged.length} 个文件已暂存
          </div>
        )}
      </div>
    </Card>
  );
}
