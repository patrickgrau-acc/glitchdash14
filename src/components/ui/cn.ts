/**
 * cn — tiny className joiner (no dependency on clsx/tailwind-merge).
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
