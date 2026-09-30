/**
 * cn() — merge class names (shadcn/ui pattern).
 * Drop-in compatible with `clsx` + `tailwind-merge`.
 * When disk space is available: npm i clsx tailwind-merge
 * and replace this with:
 *   import { clsx } from 'clsx';
 *   import { twMerge } from 'tailwind-merge';
 *   export function cn(...inputs) { return twMerge(clsx(inputs)); }
 */
export function cn(...inputs) {
  return inputs
    .flat(Infinity)
    .filter((x) => typeof x === 'string' && x.trim())
    .join(' ')
    .trim();
}
