import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// use clsx to merge class names in tailwind, pretty arbitrary thing and realistically you can just do this with string literals
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// a quick url consturctor for the chat ids 
export function chatHrefConstructor (id1: string, id2: string) {
  const sortedIds = [id1, id2].sort()
  return `${sortedIds[0]}--${sortedIds[1]}`
}

// pusher doesnt like colons so we need to replace them 
export function replaceColons (str: string) {
  return str.replace(/:/g, '__')
}