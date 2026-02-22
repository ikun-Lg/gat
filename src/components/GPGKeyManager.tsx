import { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Key, RefreshCw, AlertCircle, Shield, ShieldOff } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { toast } from '../store/toastStore';

interface GpgKey {
  key_id: string;
  user_id: string;
  email: string;
  created_at: string | null;
  has_private_key: boolean;
}

interface GPGKeyManagerProps {
  repoPath: string | null;
}

export function GPGKeyManager({ repoPath }: GPGKeyManagerProps) {
  const [gpgKeys, setGpgKeys] = useState<GpgKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);

  const loadGpgKeys = async () => {
    setIsLoading(true);
    try {
      const keys = await invoke<GpgKey[]>('get_gpg_keys');
      setGpgKeys(keys);
    } catch (error) {
      console.error('Failed to load GPG keys:', error);
      toast.error('加载GPG密钥失败，请确保已安装GPG');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGpgKeys();
  }, []);

  const handleConfigureSigning = async (keyId: string) => {
    if (!repoPath) {
      toast.error('未打开仓库');
      return;
    }

    setIsConfiguring(true);
    try {
      await invoke('configure_gpg_signing', {
        repoPath,
        keyId,
        signAll: true,
      });

      toast.success('GPG签名已启用');
    } catch (error) {
      console.error('Failed to configure GPG signing:', error);
      toast.error(`配置GPG签名失败: ${error}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleDisableSigning = async () => {
    if (!repoPath) {
      toast.error('未打开仓库');
      return;
    }

    setIsConfiguring(true);
    try {
      await invoke('disable_gpg_signing', { repoPath });
      toast.success('GPG签名已禁用');
    } catch (error) {
      console.error('Failed to disable GPG signing:', error);
      toast.error(`禁用GPG签名失败: ${error}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">GPG 密钥管理</h4>
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 text-xs"
          onClick={loadGpgKeys}
          disabled={isLoading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {!repoPath && (
        <div className="p-3 bg-muted/30 rounded-md text-sm text-muted-foreground">
          打开仓库后可以配置GPG签名
        </div>
      )}

      <div className="space-y-3">
        {gpgKeys.length === 0 && !isLoading && (
          <div className="p-4 bg-muted/30 rounded-lg text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Key className="w-8 h-8 opacity-50" />
              <div>
                <p>未找到GPG密钥</p>
                <p className="text-xs mt-1">请先使用命令行生成GPG密钥：</p>
                <code className="block mt-1 text-xs bg-background p-2 rounded">
                  gpg --full-generate-key
                </code>
              </div>
            </div>
          </div>
        )}

        {gpgKeys.map((key) => (
          <div
            key={key.key_id}
            className="p-4 bg-muted/30 rounded-lg space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Key className="w-4 h-4 text-primary" />
                  <span className="text-sm font-mono font-medium">
                    {key.key_id}
                  </span>
                  {key.has_private_key && (
                    <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full">
                      有私钥
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {key.user_id}
                </p>
                {key.email && (
                  <p className="text-xs text-muted-foreground">
                    {key.email}
                  </p>
                )}
                {key.created_at && (
                  <p className="text-xs text-muted-foreground">
                    创建时间: {new Date(key.created_at).toLocaleString('zh-CN')}
                  </p>
                )}
              </div>

              <div className="flex gap-1">
                {key.has_private_key && repoPath && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => handleConfigureSigning(key.key_id)}
                    disabled={isConfiguring}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    启用签名
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {repoPath && (
        <div className="p-3 bg-muted/30 rounded-md space-y-2">
          <Button
            variant="ghost"
            className="w-full h-7 gap-1.5 text-xs text-muted-foreground"
            onClick={handleDisableSigning}
            disabled={isConfiguring}
          >
            <ShieldOff className="w-3.5 h-3.5" />
            禁用GPG签名
          </Button>
        </div>
      )}

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>GPG签名:</strong> 启用GPG签名后，所有提交和标签都会使用GPG密钥进行签名，确保提交的真实性和完整性。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
