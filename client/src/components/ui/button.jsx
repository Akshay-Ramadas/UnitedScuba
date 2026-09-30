import { cn } from '../../lib/utils.js';

const variants = {
  default:     'sh-btn sh-btn-default',
  secondary:   'sh-btn sh-btn-secondary',
  outline:     'sh-btn sh-btn-outline',
  ghost:       'sh-btn sh-btn-ghost',
  destructive: 'sh-btn sh-btn-destructive',
  link:        'sh-btn sh-btn-link',
};
const sizes = { default: '', sm: 'sh-btn-sm', lg: 'sh-btn-lg', icon: 'sh-btn-icon' };

export function Button({ variant = 'default', size = 'default', className, children, asChild, ...props }) {
  const cls = cn(variants[variant], sizes[size], className);
  if (asChild && children?.type) {
    return { ...children, props: { ...children.props, className: cn(cls, children.props.className), ...props } };
  }
  return <button className={cls} {...props}>{children}</button>;
}
