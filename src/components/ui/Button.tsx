import { cn } from '../../lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none';

    const variants = {
      default: 'bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-primary/90 active:shadow-inner active:translate-y-[0.5px]',
      destructive: 'bg-destructive text-destructive-foreground shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:bg-destructive/90 active:shadow-inner',
      outline: 'border border-border/80 bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:shadow-inner',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      ghost: 'hover:bg-accent/50 hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    };

    const sizes = {
      default: 'h-8 px-4 py-1.5 text-xs',
      sm: 'h-7 rounded-md px-3 text-[11px]',
      lg: 'h-10 rounded-md px-8',
      icon: 'h-8 w-8',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };
