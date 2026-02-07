import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ScanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (path: string) => Promise<void>;
}

export function ScanDialog({ isOpen, onClose, onScan }: ScanDialogProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择要扫描的目录',
      });

      if (selected && typeof selected === 'string') {
        setIsScanning(true);
        await onScan(selected);
        onClose();
      }
    } catch (e) {
      console.error('扫描失败:', e);
    } finally {
      setIsScanning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">扫描目录</h2>
            <p className="text-muted-foreground text-sm mt-1">
              选择一个目录以扫描 Git 仓库
            </p>
          </div>

          <Button onClick={handleScan} disabled={isScanning} className="w-full">
            {isScanning ? '扫描中...' : '选择目录'}
          </Button>

          <Button variant="outline" onClick={onClose} className="w-full">
            取消
          </Button>
        </div>
      </Card>
    </div>
  );
}
