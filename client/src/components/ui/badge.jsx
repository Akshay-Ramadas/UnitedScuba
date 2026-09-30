import { cn } from '../../lib/utils.js';

const variants = {
  default:     'sh-badge sh-badge-default',
  secondary:   'sh-badge sh-badge-secondary',
  destructive: 'sh-badge sh-badge-destructive',
  outline:     'sh-badge sh-badge-outline',
  new:         'sh-badge sh-badge-new',
  contacted:   'sh-badge sh-badge-contacted',
  'in-progress': 'sh-badge sh-badge-progress',
  completed:   'sh-badge sh-badge-completed',
  closed:      'sh-badge sh-badge-closed',
};

export function Badge({ variant = 'default', className, ...p }) {
  return <span className={cn(variants[variant] ?? variants.secondary, className)} {...p} />;
}
