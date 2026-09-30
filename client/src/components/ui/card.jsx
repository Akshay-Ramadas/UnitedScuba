import { cn } from '../../lib/utils.js';

export const Card = ({ className, ...p }) => <div className={cn('sh-card', className)} {...p} />;
export const CardHeader = ({ className, ...p }) => <div className={cn('sh-card-header', className)} {...p} />;
export const CardTitle = ({ className, ...p }) => <h3 className={cn('sh-card-title', className)} {...p} />;
export const CardDescription = ({ className, ...p }) => <p className={cn('sh-card-description', className)} {...p} />;
export const CardContent = ({ className, ...p }) => <div className={cn('sh-card-content', className)} {...p} />;
export const CardFooter = ({ className, ...p }) => <div className={cn('sh-card-footer', className)} {...p} />;
