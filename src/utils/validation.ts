/**
 * Safe parameter validation and parsing utilities for Quran API
 */

export interface IntegerParamOptions {
  min?: number;
  max?: number;
  defaultValue?: number;
}

/**
 * Parses and validates an integer parameter from path or query string.
 * Returns null if invalid or out of specified bounds.
 */
export function parseIntegerParam(
  value: string | undefined | null,
  options: IntegerParamOptions = {}
): number | null {
  if (value === undefined || value === null || typeof value !== 'string' || value.trim() === '') {
    return options.defaultValue !== undefined ? options.defaultValue : null;
  }

  const parsed = parseInt(value.trim(), 10);
  if (isNaN(parsed)) {
    return null;
  }

  if (options.min !== undefined && parsed < options.min) {
    return null;
  }

  if (options.max !== undefined && parsed > options.max) {
    return null;
  }

  return parsed;
}
