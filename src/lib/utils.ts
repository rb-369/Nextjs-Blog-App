import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {

  return text
  .toLowerCase()
  .replace(/[^a-z0-9 ]+/g, "")
  .replace(/ +/g, "-")
  //converts space to hyphens "-" eg. Next js 15 -> Next-js-15 

}

export function formatDate(date: Date): string {
  
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date)
}

export function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}