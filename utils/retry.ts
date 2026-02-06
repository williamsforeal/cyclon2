/**
 * Retry Logic Utility
 * ADHD-friendly: Simple, predictable retry behavior with backoff
 */

import { RetryableError } from '../types/schemas';

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffMultiplier?: number;
  retryableErrors?: string[]; // Error messages that should trigger retry
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'Rate limit',
    '429',
    '503',
    '504',
  ],
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if error should be retried
 */
function isRetryableError(error: any, retryableErrors: string[]): boolean {
  const errorMessage = error?.message || error?.toString() || '';
  const errorCode = error?.code || error?.response?.status?.toString() || '';

  return retryableErrors.some(
    (pattern) =>
      errorMessage.includes(pattern) || errorCode.includes(pattern)
  );
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number
): number {
  const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      console.log(
        attempt > 0
          ? `Retry attempt ${attempt}/${opts.maxRetries}...`
          : 'Attempting operation...'
      );

      return await fn();
    } catch (error: any) {
      lastError = error;

      const canRetry =
        attempt < opts.maxRetries &&
        isRetryableError(error, opts.retryableErrors);

      if (!canRetry) {
        console.error(
          `Operation failed after ${attempt} attempts:`,
          error.message || error
        );
        throw error;
      }

      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier
      );

      console.warn(
        `Operation failed (attempt ${attempt + 1}/${
          opts.maxRetries + 1
        }): ${error.message || error}. Retrying in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Create a retryable version of a function
 */
export function makeRetryable<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: any[]) => withRetry(() => fn(...args), options)) as T;
}

/**
 * Batch processing with retry
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    retryOptions?: RetryOptions;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<R[]> {
  const { batchSize = 5, retryOptions, onProgress } = options;
  const results: R[] = [];
  const total = items.length;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item) => withRetry(() => processor(item), retryOptions))
    );
    results.push(...batchResults);

    if (onProgress) {
      onProgress(Math.min(i + batchSize, total), total);
    }
  }

  return results;
}
