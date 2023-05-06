import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// use clsx to merge class names in tailwind, pretty arbitrary thing and realistically you can just do this with string literals
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

