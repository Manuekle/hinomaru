import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>;
export type WithElementRef<T, E extends HTMLElement = HTMLElement> = T & { ref?: E | null };
