"use client";
/**
 * Icon — renders a lucide-react icon by name.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 *   <Icon name="Settings" className="w-4 h-4" />
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
  strokeWidth?: number;
}

export function Icon({ name, className, size, strokeWidth }: IconProps) {
  const Cmp = (Lucide as Record<string, any>)[name] || (Lucide as any).Circle;
  return <Cmp className={className} size={size} strokeWidth={strokeWidth} aria-hidden="true" />;
}
