import { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Download, FileText, Database, Table, FileImage, Image, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { exportCommits } from '../lib/exportUtils';
import { toast } from '../store/toastStore';
import type { CommitInfo } from '../types';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  commits: CommitInfo[];
  repoName: string;
  branch: string;
}

type ExportFormat = 'markdown' | 'json' | 'csv' | 'svg' | 'png';

export function ExportDialog({ isOpen, onClose, commits, repoName, branch }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('markdown');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const formats = [
    { id: 'markdown' as ExportFormat, label: 'Markdown', icon: FileText, description: '格式化的文档，适合阅读' },
    { id: 'json' as ExportFormat, label: 'JSON', icon: Database, description: '结构化数据，便于程序处理' },
    { id: 'csv' as ExportFormat, label: 'CSV', icon: Table, description: '表格数据，可用 Excel 打开' },
    { id: 'svg' as ExportFormat, label: 'SVG', icon: FileImage, description: '矢量图形，可无损缩放' },
    { id: 'png' as ExportFormat, label: 'PNG', icon: Image, description: '位图图像，适合分享' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (selectedFormat === 'svg' || selectedFormat === 'png') {
        await exportGraph(selectedFormat);
      } else {
        await exportCommits(selectedFormat, { repoName, branch, commits });
        toast.success(`导出 ${selectedFormat.toUpperCase()} 成功`);
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`导出失败: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportGraph = async (format: 'svg' | 'png') => {
    try {
      const svgElement = document.querySelector('svg.overflow-visible') as SVGElement;
      if (!svgElement) {
        toast.error('未找到提交图，请确保图表已显示');
        return;
      }

      if (format === 'svg') {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${repoName}-${branch}-graph.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('导出 SVG 成功');
      } else if (format === 'png') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          toast.error('无法创建画布');
          return;
        }

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = document.createElement('img');

        img.onload = () => {
          canvas.width = svgElement.getBoundingClientRect().width * 2;
          canvas.height = svgElement.getBoundingClientRect().height * 2;
          ctx.scale(2, 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);

          canvas.toBlob((blob) => {
            if (blob) {
              const pngUrl = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `${repoName}-${branch}-graph.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(pngUrl);
              toast.success('导出 PNG 成功');
            }
          }, 'image/png');
        };

        img.onerror = () => {
          toast.error('图片加载失败');
          URL.revokeObjectURL(url);
        };

        img.src = url;
      }
    } catch (error) {
      console.error('Export graph failed:', error);
      toast.error('导出图形失败');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
      <Card className="w-full max-w-lg p-6 shadow-2xl border-white/20 bg-background/95 backdrop-blur-xl">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Download className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">导出提交历史</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              选择导出格式（共 {commits.length} 条提交记录）
            </p>

            <div className="grid grid-cols-1 gap-2">
              {formats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border text-left transition-all",
                      selectedFormat === format.id
                        ? "bg-primary/10 border-primary/50 shadow-sm"
                        : "bg-background/50 border-border/40 hover:border-primary/30 hover:bg-accent/50"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      selectedFormat === format.id
                        ? "bg-primary/20 text-primary"
                        : "bg-muted/50 text-muted-foreground"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium",
                        selectedFormat === format.id ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {format.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-border/20">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isExporting}
              className="hover:bg-muted"
            >
              取消
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? '导出中...' : '导出'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
