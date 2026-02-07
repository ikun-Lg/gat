import { formatShortcut, shortcutManager } from '../lib/shortcuts';
import { X } from 'lucide-react';
import { Button } from './ui/Button';

interface ShortcutHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutHelp({ isOpen, onClose }: ShortcutHelpProps) {
  if (!isOpen) return null;

  const allShortcuts = shortcutManager.getAllShortcuts();

  // Group shortcuts by category
  const grouped = {
    view: allShortcuts.filter(s => s.description.includes('视图')),
    actions: allShortcuts.filter(s => ['提交', '暂存', '推送', '拉取', '贮存', '刷新'].some(k => s.description.includes(k))),
    navigation: allShortcuts.filter(s => ['搜索', '命令面板'].some(k => s.description.includes(k))),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <h2 className="text-lg font-semibold">键盘快捷键</h2>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* View shortcuts */}
          {grouped.view.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">视图</h3>
              <div className="space-y-2">
                {grouped.view.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded-md border border-border/50">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action shortcuts */}
          {grouped.actions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">操作</h3>
              <div className="space-y-2">
                {grouped.actions.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded-md border border-border/50">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation shortcuts */}
          {grouped.navigation.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">导航</h3>
              <div className="space-y-2">
                {grouped.navigation.map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded-md border border-border/50">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border/50 bg-muted/30 rounded-b-xl">
          <p className="text-xs text-muted-foreground text-center">
            按 <kbd className="px-1.5 py-0.5 text-xs font-mono bg-background rounded border border-border/50">?</kbd> 查看快捷键
          </p>
        </div>
      </div>
    </div>
  );
}
