import { cn } from '../../lib/utils.js';
export const Input = ({ className, type, ...p }) =>
  <input type={type ?? 'text'} className={cn('sh-input', className)} {...p} />;
export const Textarea = ({ className, ...p }) =>
  <textarea className={cn('sh-input sh-textarea', className)} {...p} />;
