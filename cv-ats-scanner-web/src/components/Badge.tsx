type BadgeVariant = 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-success-bg text-success border-success/10',
  warning: 'bg-warning-bg text-warning border-warning/10',
  error: 'bg-error-bg text-error border-error/10',
  neutral: 'bg-[#f2f2ee] text-text-secondary border-[#e6e5df]',
};

export function Badge({
  children,
  variant = 'neutral',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-1',
        'text-[10px] font-semibold tracking-wide',
        variantStyles[variant],
      ].join(' ')}
    >
      {children}
    </span>
  );
}