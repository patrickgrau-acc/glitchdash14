/**
 * API Framework — Canonical Type Definitions
 *
 * INFRASTRUCTURE FILE — DO NOT MODIFY
 *
 * @business-card
 * @module api-types
 * @exports ApiResponse, ApiError, PaginatedResponse
 */

/** Standard API response wrapper. */
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

/** Standard API error shape. */
export interface ApiError {
  status: number;
  message: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

/** Paginated list response. */
export interface PaginatedResponse<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
