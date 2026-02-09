import { useThemeStore, PrimaryColor } from '../store/themeStore';
import { useSettingsStore } from '../store/settingsStore';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { X, Key, GitBranch, Settings as SettingsIcon, Keyboard, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ShortcutConfigPanel } from './ShortcutConfigPanel';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'general' | 'appearance' | 'ai' | 'git' | 'shortcuts';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: '通用', icon: <SettingsIcon className="w-4 h-4" /> },
  { id: 'appearance', label: '外观', icon: <Palette className="w-4 h-4" /> },
  { id: 'shortcuts', label: '快捷键', icon: <Keyboard className="w-4 h-4" /> },
  { id: 'ai', label: 'AI 设置', icon: <Key className="w-4 h-4" /> },
  { id: 'git', label: 'Git 凭据', icon: <GitBranch className="w-4 h-4" /> },
];

export function Settings({ isOpen, onClose }: SettingsProps) {
  // ... (existing store hooks)
  const {
    workDir,
    aiProvider,
    deepseekApiKey,
    glmApiKey,
    commitLanguage,
    commitFormat,
    customPrompt,
    gitUsername: savedGitUsername,
    gitPassword: savedGitPassword,
    setAiProvider,
    setDeepseekApiKey,
    setGlmApiKey,
    setCommitLanguage,
    setCommitFormat,
    setCustomPrompt,
    setGitUsername: saveGitUsername,
    setGitPassword: saveGitPassword,
    openaiApiKey,
    openaiEndpoint,
    openaiModel,
    claudeApiKey,
    claudeEndpoint,
    claudeModel,
    ollamaEndpoint,
    ollamaModel,
    setOpenaiApiKey,
    setOpenaiEndpoint,
    setOpenaiModel,
    setClaudeApiKey,
    setClaudeEndpoint,
    setClaudeModel,
    setOllamaEndpoint,
    setOllamaModel,
    autoFetchInterval,
    enableNotifications,
    setAutoFetchInterval,
    setEnableNotifications,
    externalEditor,
    setExternalEditor,
  } = useSettingsStore();

  const { mode, setMode, primaryColor, setPrimaryColor } = useThemeStore();

  const [activeTab, setActiveTab] = useState<Tab>('general');
  // ... (existing local state)
  const [localUsername, setLocalUsername] = useState(savedGitUsername || '');
  const [localPassword, setLocalPassword] = useState(savedGitPassword || '');
  const [isLoadingUsername, setIsLoadingUsername] = useState(true);

  // ... (existing effects)
  // Load git username from global config only if not already set
  useEffect(() => {
    if (!savedGitUsername) {
      invoke<string | null>('get_git_username', { path: '.' })
        .then(name => {
          if (name) {
            setLocalUsername(name);
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingUsername(false));
    } else {
      setLocalUsername(savedGitUsername);
      setIsLoadingUsername(false);
    }
  }, [savedGitUsername]);

  // Update local state when saved values change
  useEffect(() => {
    if (savedGitUsername) setLocalUsername(savedGitUsername);
    if (savedGitPassword) setLocalPassword(savedGitPassword);
  }, [savedGitUsername, savedGitPassword]);

  if (!isOpen) return null;

  const handleSaveGitCredentials = () => {
    saveGitUsername(localUsername || null);
    saveGitPassword(localPassword || null);
  };

  const handleClearGitCredentials = () => {
    saveGitUsername(null);
    saveGitPassword(null);
    setLocalUsername('');
    setLocalPassword('');
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl flex h-[500px] overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-accent"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Sidebar */}
          <div className="w-48 border-r bg-muted/30 p-2">
            <h2 className="text-lg font-semibold px-3 py-2">设置</h2>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50 text-muted-foreground'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">外观设置</h3>
                
                {/* Theme Mode */}
                <div className="space-y-2">
                  <Label>主题模式</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={mode === 'light' ? 'default' : 'outline'}
                      onClick={() => setMode('light')}
                      className="w-full"
                    >
                      浅色
                    </Button>
                    <Button
                      type="button"
                      variant={mode === 'dark' ? 'default' : 'outline'}
                      onClick={() => setMode('dark')}
                      className="w-full"
                    >
                      深色
                    </Button>
                    <Button
                      type="button"
                      variant={mode === 'system' ? 'default' : 'outline'}
                      onClick={() => setMode('system')}
                      className="w-full"
                    >
                      跟随系统
                    </Button>
                  </div>
                </div>

                {/* Primary Color */}
                <div className="space-y-2">
                  <Label>主题色</Label>
                  <div className="flex gap-3">
                    {(['blue', 'purple', 'green', 'red', 'orange'] as PrimaryColor[]).map((color) => (
                      <button
                        key={color}
                        onClick={() => setPrimaryColor(color)}
                        className={`w-8 h-8 rounded-full transition-all border-2 ${
                          primaryColor === color ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
                        }`}
                        style={{
                            backgroundColor: {
                                blue: 'hsl(211 100% 50%)',
                                purple: 'hsl(267 100% 61%)',
                                green: 'hsl(142 76% 36%)',
                                red: 'hsl(0 84% 60%)',
                                orange: 'hsl(24 95% 53%)',
                            }[color]
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* General Settings */}
            {activeTab === 'general' && (
               // ... existing general settings content
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">通用设置</h3>

                {/* 工作目录 */}
                <div className="space-y-2">
                  <Label>工作目录</Label>
                  <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">
                    {workDir || '未设置'}
                  </div>
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
                      可用变量: {'{{changes}}'} - 文件变更列表
                    </p>
                  </div>
                )}
                {/* Background Monitoring */}
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-medium">后台监控</h4>
                    
                    <div className="flex items-center justify-between">
                        <Label htmlFor="enable-notifications" className="cursor-pointer">启用通知</Label>
                        <div className="flex items-center h-6">
                             <input
                                id="enable-notifications"
                                type="checkbox"
                                checked={enableNotifications}
                                onChange={(e) => setEnableNotifications(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                             />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>自动获取间隔 (分钟)</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="0"
                                value={autoFetchInterval}
                                onChange={(e) => setAutoFetchInterval(parseInt(e.target.value) || 0)}
                                className="w-24"
                            />
                            <span className="text-xs text-muted-foreground">
                                设置为 0 禁用自动获取
                            </span>
                        </div>
                    </div>
                </div>

                {/* External Editor */}
                <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-medium">外部编辑器</h4>
                    <div className="space-y-2">
                        <Label>默认编辑器</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'code', label: 'VS Code' },
                                { id: 'cursor', label: 'Cursor' },
                                { id: 'idea', label: 'IntelliJ' },
                                { id: 'webstorm', label: 'WebStorm' },
                                { id: 'sublime', label: 'Sublime' },
                            ].map(editor => (
                                <Button
                                    key={editor.id}
                                    type="button"
                                    variant={externalEditor === editor.id ? 'default' : 'outline'}
                                    onClick={() => setExternalEditor(editor.id)}
                                    className="justify-start px-3"
                                >
                                    {editor.label}
                                </Button>
                            ))}
                            <Button
                                type="button"
                                variant={!['code', 'cursor', 'idea', 'webstorm', 'sublime'].includes(externalEditor || '') ? 'default' : 'outline'}
                                onClick={() => setExternalEditor('custom')} 
                                className="justify-start px-3"
                            >
                                自定义
                            </Button>
                        </div>
                        
                        {!['code', 'cursor', 'idea', 'webstorm', 'sublime'].includes(externalEditor || '') && (
                            <div className="mt-2">
                                <Label className="text-xs mb-1.5 block">自定义命令 / 路径</Label>
                                <Input 
                                    value={externalEditor === 'custom' ? '' : (externalEditor || '')}
                                    onChange={(e) => setExternalEditor(e.target.value)}
                                    placeholder="例如: code-insiders, vim, /usr/local/bin/subl"
                                />
                            </div>
                        )}
                        
                        <p className="text-xs text-muted-foreground mt-1">
                            选择在查看文件时使用的外部编辑器。
                        </p>
                    </div>
                </div>
              </div>
            )}
            
            {/* Shortcuts Settings */}
            {activeTab === 'shortcuts' && (
              <ShortcutConfigPanel />
            )}

            {/* AI Settings */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">AI 设置</h3>

                {/* AI 提供商 */}
                <div className="space-y-2">
                  <Label>AI 提供商</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={aiProvider === 'heuristic' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('heuristic')}
                      className="w-full"
                    >
                      启发式
                    </Button>
                    <Button
                      type="button"
                      variant={aiProvider === 'deepseek' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('deepseek')}
                      className="w-full"
                    >
                      DeepSeek
                    </Button>
                    <Button
                      type="button"
                      variant={aiProvider === 'glm' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('glm')}
                      className="w-full"
                    >
                      GLM
                    </Button>
                    <Button
                      type="button"
                      variant={aiProvider === 'openai' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('openai')}
                      className="w-full"
                    >
                      OpenAI
                    </Button>
                    <Button
                      type="button"
                      variant={aiProvider === 'claude' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('claude')}
                      className="w-full"
                    >
                      Claude
                    </Button>
                    <Button
                      type="button"
                      variant={aiProvider === 'ollama' ? 'default' : 'outline'}
                      onClick={() => setAiProvider('ollama')}
                      className="w-full"
                    >
                      Ollama
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
                    <p className="text-xs text-muted-foreground">
                      在 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">DeepSeek 平台</a> 获取 API Key
                    </p>
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
                    <p className="text-xs text-muted-foreground">
                      在 <a href="https://open.bigmodel.cn/usercenter/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">智谱 AI 平台</a> 获取 API Key
                    </p>
                  </div>
                )}

                {/* OpenAI Settings */}
                {aiProvider === 'openai' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>OpenAI API Key</Label>
                      <Input
                        type="password"
                        value={openaiApiKey || ''}
                        onChange={(e) => setOpenaiApiKey(e.target.value)}
                        placeholder="sk-..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Endpoint (可选)</Label>
                      <Input
                        value={openaiEndpoint || ''}
                        onChange={(e) => setOpenaiEndpoint(e.target.value)}
                        placeholder="https://api.openai.com/v1/chat/completions"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model (可选)</Label>
                      <Input
                        value={openaiModel || ''}
                        onChange={(e) => setOpenaiModel(e.target.value)}
                        placeholder="gpt-4o"
                      />
                    </div>
                  </div>
                )}

                {/* Claude Settings */}
                {aiProvider === 'claude' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Claude API Key</Label>
                      <Input
                        type="password"
                        value={claudeApiKey || ''}
                        onChange={(e) => setClaudeApiKey(e.target.value)}
                        placeholder="sk-ant-..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Endpoint (可选)</Label>
                      <Input
                        value={claudeEndpoint || ''}
                        onChange={(e) => setClaudeEndpoint(e.target.value)}
                        placeholder="https://api.anthropic.com/v1/messages"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model (可选)</Label>
                      <Input
                        value={claudeModel || ''}
                        onChange={(e) => setClaudeModel(e.target.value)}
                        placeholder="claude-3-5-sonnet-20240620"
                      />
                    </div>
                  </div>
                )}

                {/* Ollama Settings */}
                {aiProvider === 'ollama' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Endpoint</Label>
                      <Input
                        value={ollamaEndpoint || ''}
                        onChange={(e) => setOllamaEndpoint(e.target.value)}
                        placeholder="http://localhost:11434/api/chat"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input
                        value={ollamaModel || ''}
                        onChange={(e) => setOllamaModel(e.target.value)}
                        placeholder="llama3"
                      />
                    </div>
                  </div>
                )}

                {aiProvider === 'heuristic' && (
                  <div className="p-3 bg-muted/30 rounded-md text-sm text-muted-foreground">
                    使用启发式规则生成提交信息，不依赖外部 AI 服务。
                  </div>
                )}
              </div>
            )}

            {/* Git Credentials */}
            {activeTab === 'git' && (
               // ... existing git credentials content
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Git 凭据</h3>

                <p className="text-sm text-muted-foreground">
                  配置 Git 凭据用于发布分支和推送提交，同时配置 GitHub/GitLab 个人访问令牌用于集成功能。
                </p>

                {/* Git User/Pass */}
                <div className="space-y-4 pb-4 border-b">
                     <h4 className="text-sm font-medium">Git HTTP 认证</h4>
                    {savedGitUsername && savedGitPassword ? (
                    <div className="space-y-4">
                        <div className="p-3 bg-muted/30 rounded-md space-y-1">
                        <div className="text-sm">
                            <span className="text-muted-foreground">用户名:</span> {savedGitUsername}
                        </div>
                        <div className="text-sm">
                            <span className="text-muted-foreground">Token:</span> {'*'.repeat(8)}
                        </div>
                        </div>
                        <Button
                        variant="destructive"
                        onClick={handleClearGitCredentials}
                        >
                        清除凭据
                        </Button>
                    </div>
                    ) : (
                    <div className="space-y-4">
                        <div className="space-y-2">
                        <Label>用户名</Label>
                        <Input
                            value={localUsername}
                            onChange={(e) => setLocalUsername(e.target.value)}
                            placeholder={isLoadingUsername ? '加载中...' : 'Git 用户名'}
                            disabled={isLoadingUsername}
                        />
                        </div>

                        <div className="space-y-2">
                        <Label>Personal Access Token (HTTPS 推送用)</Label>
                        <Input
                            type="password"
                            value={localPassword}
                            onChange={(e) => setLocalPassword(e.target.value)}
                            placeholder="输入 Personal Access Token"
                        />
                        </div>

                        <Button
                        onClick={handleSaveGitCredentials}
                        disabled={!localUsername || !localPassword}
                        className="w-full"
                        >
                        保存凭据
                        </Button>
                    </div>
                    )}
                </div>

                {/* Integration Tokens */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium">平台集成 (GitHub/GitLab)</h4>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>GitHub Token</Label>
                            <Input
                                type="password"
                                value={useSettingsStore.getState().githubToken || ''}
                                onChange={(e) => useSettingsStore.getState().setGithubToken(e.target.value)}
                                placeholder="GitHub Personal Access Token"
                            />
                            <p className="text-xs text-muted-foreground">
                                用于访问 GitHub Pull Requests 和 Issues。需勾选 repo 权限。
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>GitLab Token</Label>
                            <Input
                                type="password"
                                value={useSettingsStore.getState().gitlabToken || ''}
                                onChange={(e) => useSettingsStore.getState().setGitlabToken(e.target.value)}
                                placeholder="GitLab Personal Access Token"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>GitLab URL (可选)</Label>
                            <Input
                                value={useSettingsStore.getState().gitlabUrl || ''}
                                onChange={(e) => useSettingsStore.getState().setGitlabUrl(e.target.value)}
                                placeholder="https://gitlab.com (默认为 gitlab.com)"
                            />
                            <p className="text-xs text-muted-foreground">
                                如果使用自托管 GitLab，请输入完整 URL。
                            </p>
                        </div>
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
