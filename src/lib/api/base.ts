import { Md5 } from 'ts-md5';
import type * as z from 'zod';
import { cleanObject } from '../../utils/object';
import { delay } from '../../utils/time';
import { isDevelopment } from '../../utils/env';

type ApiConfig = {
  baseURL: string;
  timeout?: number;
  cacheEnabled?: boolean;
  cacheTTL?: number;
};

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
};

type RequestConfig<T = unknown> = {
  params?: Record<string, string>;
  schema?: z.ZodSchema<T>;
} & RequestInit;

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

export class BaseApiClient {
  protected adminAccessKey = '';

  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly cacheEnabled: boolean;
  private readonly cacheTTL: number;
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private readonly locks = new Map<string, true>();
  private readonly delayOnCacheHit = 200;
  private readonly delayOnRequest = 300;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout ?? 30_000;
    this.cacheEnabled = config.cacheEnabled ?? true;
    this.cacheTTL = config.cacheTTL ?? 30_000; // 30 seconds default
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generates a cache key for a given endpoint and params
   * This is exposed for manual cache management
   */
  public getCacheKey(endpoint: string, params?: Record<string, string | number | boolean>): string {
    return this.generateCacheKey(endpoint, params);
  }

  /**
   * Checks if a cache entry exists and is valid
   */
  public hasCachedData(cacheKey: string): boolean {
    if (!this.cacheEnabled) return false;

    const entry = this.cache.get(cacheKey);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      return false;
    }

    return true;
  }

  /**
   * Clears a specific cache entry
   */
  public clearCacheEntry(cacheKey: string): void {
    this.cache.delete(cacheKey);
  }

  /**
   * Gets remaining TTL for a cache entry in milliseconds
   */
  public getCacheTTL(cacheKey: string): number {
    const entry = this.cache.get(cacheKey);
    if (!entry) return 0;

    const elapsed = Date.now() - entry.timestamp;
    const remaining = entry.ttl - elapsed;
    return Math.max(0, remaining);
  }

  async get<T, R = unknown>(
    endpoint: string,
    params?: R,
    schema?: z.ZodSchema<T>,
    paramsSchema?: z.ZodSchema<R>
  ): Promise<T> {
    const cleanParams = params
      ? cleanObject(paramsSchema?.parse(params) ?? params, true)
      : undefined;

    // Check cache first
    const cacheKey = this.generateCacheKey(endpoint, cleanParams);
    const cachedData = this.getCachedData<T>(cacheKey);
    if (cachedData !== undefined) {
      return cachedData;
    }

    if (this.locks.has(cacheKey)) {
      await delay(this.delayOnCacheHit);
      return this.get(endpoint, params, schema, paramsSchema);
    }

    this.locks.set(cacheKey, true);
    try {
      // Make request and cache result
      const result = await this.request<T>(endpoint, {
        method: 'GET',
        params: cleanParams,
        schema,
      });

      // Cache the result
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('API request failed', error, {
        module: 'BaseApiClient',
        action: 'request',
      });
      throw error;
    } finally {
      this.locks.delete(cacheKey);
    }
  }

  async post<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>
  ): Promise<T> {
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint);

    return result;
  }

  async put<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>
  ): Promise<T> {
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint);

    return result;
  }

  async patch<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>
  ): Promise<T> {
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint);

    return result;
  }

  async delete<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>
  ): Promise<T> {
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
      schema,
      headers: {
        'X-CACHE-CONTROL': 'no-cache',
      },
    });

    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint);

    return result;
  }

  private getAuthToken(): string | undefined {
    return '';
  }

  private invalidateRelatedCache(endpoint: string): void {
    if (!this.cacheEnabled) return;

    // Extract the resource path from endpoint (e.g., '/users/123' -> '/users')
    const resourcePath = endpoint.split('/').slice(0, 2).join('/');

    for (const key of this.cache.keys()) {
      if (key.includes(resourcePath)) {
        this.cache.delete(key);
      }
    }
  }

  private generateCacheKey(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value.toString());
      }
    }

    return url.toString();
  }

  private getCachedData<T>(cacheKey: string): T | undefined {
    if (!this.cacheEnabled) return undefined;

    const entry = this.cache.get(cacheKey) as CacheEntry<T> | undefined;
    if (!entry) return undefined;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      return undefined;
    }

    return entry.data;
  }

  private async request<T>(endpoint: string, config: RequestConfig<T> = {}): Promise<T> {
    const { params, schema, ...init } = config;
    const isGetRequest = init.method === 'GET';

    // Add configurable delay in development mode
    if (isDevelopment) {
      const DELAY_MS = Number(import.meta.env.VITE_API_DELAY ?? 500);
      await delay(DELAY_MS);
    }

    const url = new URL(`${this.baseURL}${endpoint}`);
    if (isGetRequest && params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
      }
    }

    const headers = new Headers(init.headers);

    if (!isGetRequest) {
      headers.set('X-CACHE-CONTROL', 'no-cache');
    }

    const token = this.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && init.body) {
      headers.set('Content-Type', 'application/json');
    }

    this.buildNonceHeaders(headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {
      const startTime = Date.now();
      const response = await fetch(url.toString(), {
        ...init,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await this.parseResponse(response);

      if (!response.ok) {
        throw new ApiError(response.status, response.statusText, data);
      }

      {
        const elapsedTime = Date.now() - startTime;
        const waitPeriod = this.delayOnRequest - elapsedTime;
        if (waitPeriod > 0) {
          console.debug(`Request delayed for ${waitPeriod}ms`);
          await delay(waitPeriod);
        }
      }

      if (schema) {
        // Validate response if schema provided
        return this.validateResponse(schema, data);
      }

      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'Request Timeout');
        }

        throw new ApiError(0, error.message);
      }

      throw new ApiError(0, 'Unknown error occurred');
    }
  }

  private validateResponse<T>(schema: z.ZodSchema<T>, data: unknown) {
    try {
      return schema.parse(data) as T;
    } catch (error) {
      throw new ApiError(422, 'Invalid response format', {
        received: data,
        error: error instanceof Error ? error.message : 'Validation failed',
      });
    }
  }

  private async parseResponse(response: Response): Promise<unknown> {
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      return undefined;
    }
    const contentType = response.headers.get('content-type');
    const hasJsonContent = contentType?.includes('application/json');
    const data = hasJsonContent ? await response.json() : undefined;
    if (data && 'success' in data) {
      return data.data;
    }
    return undefined;
  }

  private buildNonceHeaders(headers: Headers): void {
    const timestamp = Date.now().toString();
    const requestKey = Math.random().toString(16).slice(2);
    const nonce = this.generateNonce(timestamp, requestKey);
    if (nonce) {
      headers.set('X-REQUEST-KEY', requestKey);
      headers.set('X-TIMESTAMP', timestamp);
      headers.set('X-NONCE', nonce);
    } else {
      // alert('nonce is empty');
    }
  }

  private setCachedData<T>(cacheKey: string, data: T, ttl?: number): void {
    if (!this.cacheEnabled) return;

    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.cacheTTL,
    });
  }

  private getMark(requestKey: string): string {
    return requestKey.slice(9, 10);
  }

  private generateNonce(timestamp: string, requestKey: string): string {
    const mark = this.getMark(requestKey);
    let count = 0;
    do {
      const md5 = new Md5();
      const random = Math.random().toString(36).slice(2, 15);
      md5.appendStr(`${random}.${timestamp}.${requestKey}`);
      const nonce = md5.end().toString();
      if (nonce.endsWith(mark)) {
        return random;
      }
      count++;
    } while (count < 1000);

    return '';
  }
}
