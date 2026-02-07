import { cn } from '../../lib/utils';

interface CheckboxProps {
  checked: boolean;
  onToggle: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({ checked, onToggle, disabled = false, className }: CheckboxProps) {
  return (
    <div
      className={cn(
        'w-4 h-4 rounded-md border border-muted-foreground/40 flex items-center justify-center flex-shrink-0 transition-all duration-200',
        checked ? 'bg-primary border-primary text-primary-foreground shadow-sm' : 'bg-background hover:bg-muted/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={(e) => !disabled && onToggle(e)}
    >
      {checked && (
        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}
