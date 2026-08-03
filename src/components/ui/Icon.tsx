"use client";
/**
 * Icon — renders a lucide-react icon by name.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 *   <Icon name="Settings" className="w-4 h-4" />
 *
 * Falls back to a neutral Circle when the name is unknown, so a bad icon
 * string never crashes the page.
 *
 * @business-card
 * @module Icon
 * @exports Icon, IconName
 */
import * as Lucide from 'lucide-react';

export type IconName = keyof typeof Lucide;

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size }: IconProps) {
  const Cmp = (Lucide as Record<string, any>)[name] || (Lucide as any).Circle;
  return <Cmp className={className} size={size} aria-hidden="true" />;
}
