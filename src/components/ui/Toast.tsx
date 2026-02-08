import { useToastStore } from '../../store/toastStore';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils'; // Assuming cn is in utils

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error: <AlertCircle className="w-5 h-5 text-red-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
};

const bgColors = {
  success: 'bg-green-500/10 border-green-500/20',
  error: 'bg-red-500/10 border-red-500/20',
  info: 'bg-blue-500/10 border-blue-500/20',
  warning: 'bg-orange-500/10 border-orange-500/20',
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 p-4 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 p-3 rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-300 animate-enter",
            "bg-background/95 border-border", // Default base
            bgColors[t.type]
          )}
        >
          <div className="shrink-0 mt-0.5">{icons[t.type]}</div>
          <div className="flex-1 text-sm pt-0.5">
            {t.message}
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 p-1 rounded-md hover:bg-muted/50 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      ))}
    </div>
  );
}
