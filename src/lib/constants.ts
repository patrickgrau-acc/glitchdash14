/**
 * App Constants — Shared configuration values.
 *
 * INFRASTRUCTURE FILE — add new constants here, don't change existing ones.
 * Import from '@/lib/constants' instead of hardcoding values.
 *
 * @business-card
 * @module constants
 * @exports APP_NAME, API_BASE_URL, ROUTES
 */

/** Application display name. */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME
  || 'Application';

/** Backend API base URL. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  || '/api';

/** Top-level route paths — add feature routes here. */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
} as const;
