import { cn } from '../../lib/utils.js';
export const Label = ({ className, ...p }) =>
  <label className={cn('sh-label', className)} {...p} />;
