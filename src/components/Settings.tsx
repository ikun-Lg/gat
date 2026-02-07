import { useSettingsStore } from '../store/settingsStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import { Label } from './ui/Label';
import { X } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const {
    workDir,
    aiProvider,
    deepseekApiKey,
    glmApiKey,
    commitLanguage,
    commitFormat,
    customPrompt,
    setAiProvider,
    setDeepseekApiKey,
    setGlmApiKey,
    setCommitLanguage,
    setCommitFormat,
    setCustomPrompt,
  } = useSettingsStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>设置</CardTitle>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 工作目录 */}
          <div className="space-y-2">
            <Label>工作目录</Label>
            <div className="text-sm text-muted-foreground">{workDir || '未设置'}</div>
          </div>

          {/* Commit 消息语言 */}
          <div className="space-y-2">
            <Label>Commit 消息语言</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={commitLanguage === 'zh' ? 'default' : 'outline'}
                onClick={() => setCommitLanguage('zh')}
                className="flex-1"
              >
                中文
              </Button>
              <Button
                type="button"
                variant={commitLanguage === 'en' ? 'default' : 'outline'}
                onClick={() => setCommitLanguage('en')}
                className="flex-1"
              >
                English
              </Button>
            </div>
          </div>

          {/* Commit 消息格式 */}
          <div className="space-y-2">
            <Label>Commit 消息格式</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={commitFormat === 'conventional' ? 'default' : 'outline'}
                onClick={() => setCommitFormat('conventional')}
                className="flex-1"
              >
                约定式提交
              </Button>
              <Button
                type="button"
                variant={commitFormat === 'custom' ? 'default' : 'outline'}
                onClick={() => setCommitFormat('custom')}
                className="flex-1"
              >
                自定义
              </Button>
            </div>
          </div>

          {/* 自定义提示词 */}
          {commitFormat === 'custom' && (
            <div className="space-y-2">
              <Label>自定义提示词</Label>
              <Input
                value={customPrompt || ''}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="输入自定义的 AI 提示词..."
              />
              <p className="text-xs text-muted-foreground">
                可用变量: {`{{changes}}`} - 文件变更列表
              </p>
            </div>
          )}

          {/* AI 提供商 */}
          <div className="space-y-2">
            <Label>AI 提供商</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={aiProvider === 'heuristic' ? 'default' : 'outline'}
                onClick={() => setAiProvider('heuristic')}
                className="flex-1"
              >
                启发式
              </Button>
              <Button
                type="button"
                variant={aiProvider === 'deepseek' ? 'default' : 'outline'}
                onClick={() => setAiProvider('deepseek')}
                className="flex-1"
              >
                DeepSeek
              </Button>
              <Button
                type="button"
                variant={aiProvider === 'glm' ? 'default' : 'outline'}
                onClick={() => setAiProvider('glm')}
                className="flex-1"
              >
                GLM
              </Button>
            </div>
          </div>

          {/* DeepSeek API Key */}
          {aiProvider === 'deepseek' && (
            <div className="space-y-2">
              <Label>DeepSeek API Key</Label>
              <Input
                type="password"
                value={deepseekApiKey || ''}
                onChange={(e) => setDeepseekApiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
          )}

          {/* GLM API Key */}
          {aiProvider === 'glm' && (
            <div className="space-y-2">
              <Label>GLM API Key</Label>
              <Input
                type="password"
                value={glmApiKey || ''}
                onChange={(e) => setGlmApiKey(e.target.value)}
                placeholder="输入 GLM API Key"
              />
            </div>
          )}
        </CardContent>

        <CardFooter>
          <Button onClick={onClose} className="w-full">
            完成
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
