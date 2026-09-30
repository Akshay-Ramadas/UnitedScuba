import { cn } from '../../lib/utils.js';
export function Separator({ orientation = 'horizontal', className, ...p }) {
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn('sh-separator', orientation === 'vertical' ? 'sh-separator-v' : 'sh-separator-h', className)}
      {...p}
    />
  );
}
