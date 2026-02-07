import { cn } from '../../lib/utils';

interface CheckboxProps {
  checked: boolean;
  onToggle: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export function Checkbox({ checked, onToggle, disabled = false }: CheckboxProps) {
  return (
    <div
      className={cn(
        'w-5 h-5 rounded border border-primary flex items-center justify-center flex-shrink-0',
        'transition-colors',
        checked ? 'bg-primary text-primary-foreground' : 'bg-background',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={(e) => !disabled && onToggle(e)}
    >
      {checked && (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}
