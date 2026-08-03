"use client";
/**
 * Card — Shadcn-style surface container.
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 * @business-card
 * @module Card
 * @exports Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
 */
import React from 'react';
import { cn } from './cn';

export function Card({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} {...rest} />;
}
export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...rest} />;
}
export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...rest} />;
}
export function CardDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-muted-foreground', className)} {...rest} />;
}
export function CardContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...rest} />;
}
export function CardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...rest} />;
}
