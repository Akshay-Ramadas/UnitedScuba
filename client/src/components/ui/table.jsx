import { cn } from '../../lib/utils.js';

export const Table        = ({ className, ...p }) => <table className={cn('sh-table', className)} {...p} />;
export const TableHeader  = ({ className, ...p }) => <thead className={cn(className)} {...p} />;
export const TableBody    = ({ className, ...p }) => <tbody className={cn(className)} {...p} />;
export const TableRow     = ({ className, ...p }) => <tr className={cn(className)} {...p} />;
export const TableHead    = ({ className, ...p }) => <th className={cn(className)} {...p} />;
export const TableCell    = ({ className, ...p }) => <td className={cn(className)} {...p} />;
export const TableWrapper = ({ className, ...p }) => <div className={cn('sh-table-wrapper', className)} {...p} />;
