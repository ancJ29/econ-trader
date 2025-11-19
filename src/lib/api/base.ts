import { cleanObj, createBrowserLogger, delay } from '@an-oct/vani-kit';
import { Md5 } from 'ts-md5';
import * as z from 'zod';
import { isDevelopment } from '../../utils/env';

const logger = createBrowserLogger('API-BASE', {
  level: 'debug',
});

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
    logger.debug('Getting cache key', { endpoint, params });
    const key = this.generateCacheKey(endpoint, params);
    logger.debug('Cache key generated', { key });
    return key;
  }

  /**
   * Checks if a cache entry exists and is valid
   */
  public hasCachedData(cacheKey: string): boolean {
    logger.debug('Checking if cache entry exists', { cacheKey });
    if (!this.cacheEnabled) return false;

    const entry = this.cache.get(cacheKey);
    if (!entry) {
      logger.debug('Cache entry not found', { cacheKey });
      return false;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      logger.debug('Cache entry expired', { cacheKey });
      return false;
    }

    logger.debug('Cache entry found', { cacheKey });
    return true;
  }

  /**
   * Clears a specific cache entry
   */
  public clearCacheEntry(cacheKey: string): void {
    logger.debug('Clearing cache entry', { cacheKey });
    this.cache.delete(cacheKey);
    logger.debug('Cache entry cleared', { cacheKey });
  }

  /**
   * Gets remaining TTL for a cache entry in milliseconds
   */
  public getCacheTTL(cacheKey: string): number {
    logger.debug('Getting cache TTL', { cacheKey });
    const entry = this.cache.get(cacheKey);
    if (!entry) {
      logger.debug('Cache entry not found', { cacheKey });
      return 0;
    }

    const elapsed = Date.now() - entry.timestamp;
    const remaining = entry.ttl - elapsed;
    logger.debug('Cache TTL remaining', { cacheKey, remaining });
    return Math.max(0, remaining);
  }

  async get<T, R = unknown>(
    endpoint: string,
    params?: R,
    schema?: z.ZodSchema<T>,
    paramsSchema?: z.ZodSchema<R>,
    options?: {
      cacheKey?: string;
      ttl?: number;
    }
  ): Promise<T> {
    logger.debug('Making GET request', { endpoint, params });
    const cleanParams = params ? cleanObj(paramsSchema?.parse(params) ?? params) : undefined;

    // Check cache first
    const cacheKey = options?.cacheKey ?? this.generateCacheKey(endpoint, cleanParams);
    logger.debug('Cache key', { cacheKey });
    const cachedData = this.getCachedData<T>(cacheKey);
    logger.debug('Cached data', { cachedData });
    if (cachedData !== undefined) {
      logger.debug('Cache hit', { cacheKey });
      return cachedData;
    }

    if (this.locks.has(cacheKey)) {
      logger.debug('Cache lock found', { cacheKey });
      await delay(this.delayOnCacheHit);
      logger.debug('Cache lock released', { cacheKey });
      return this.get(endpoint, params, schema, paramsSchema);
    }

    this.locks.set(cacheKey, true);
    logger.debug('Cache lock set', { cacheKey });
    try {
      logger.debug('Making request', { endpoint, params });
      // Make request and cache result
      const result = await this.request<T>(endpoint, {
        method: 'GET',
        params: cleanParams,
        schema,
      });

      logger.debug('Request successful', { cacheKey });
      // Cache the result
      this.setCachedData(cacheKey, result, options?.ttl);
      return result;
    } catch (error) {
      logger.error('Request failed', error, { cacheKey });
      console.error('API request failed', error, {
        module: 'BaseApiClient',
        action: 'request',
      });
      throw error;
    } finally {
      logger.debug('Cache lock deleted', { cacheKey });
      this.locks.delete(cacheKey);
    }
  }

  async post<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>
  ): Promise<T> {
    logger.debug('Making POST request', { endpoint, data });
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    logger.debug('Invalidating related cache entries', { endpoint });
    this.invalidateRelatedCache(endpoint);

    logger.debug('POST request successful', { endpoint });
    return result;
  }

  async put<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>
  ): Promise<T> {
    logger.debug('Making PUT request', { endpoint, data });
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    logger.debug('Invalidating related cache entries', { endpoint });
    this.invalidateRelatedCache(endpoint);

    logger.debug('PUT request successful', { endpoint });
    return result;
  }

  async patch<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>
  ): Promise<T> {
    logger.debug('Making PATCH request', { endpoint, data });
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      schema,
    });

    // Invalidate related cache entries
    logger.debug('Invalidating related cache entries', { endpoint });
    this.invalidateRelatedCache(endpoint);

    logger.debug('PATCH request successful', { endpoint });
    return result;
  }

  async delete<T, R = unknown>(
    endpoint: string,
    data?: unknown,
    schema?: z.ZodSchema<T>,
    dataSchema?: z.ZodSchema<R>
  ): Promise<T> {
    logger.debug('Making DELETE request', { endpoint, data });
    data = dataSchema?.parse(data) ?? data;
    const result = await this.request<T>(endpoint, {
      method: 'DELETE',
      schema,
      body: data ? JSON.stringify(data) : undefined,
    });

    // Invalidate related cache entries
    logger.debug('Invalidating related cache entries', { endpoint });
    this.invalidateRelatedCache(endpoint);

    logger.debug('DELETE request successful', { endpoint });
    return result;
  }

  private getAuthToken(): string {
    return sessionStorage.getItem('token') ?? '';
  }

  private invalidateRelatedCache(endpoint: string): void {
    logger.debug('Invalidating related cache entries', { endpoint });
    if (!this.cacheEnabled) return;

    // Extract the resource path from endpoint (e.g., '/users/123' → '/users')
    const resourcePath = endpoint.split('/').slice(0, 2).join('/');

    for (const key of this.cache.keys()) {
      if (key.includes(resourcePath)) {
        this.cache.delete(key);
      }
    }
    logger.debug('Related cache entries invalidated', { endpoint });
  }

  private generateCacheKey(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    logger.debug('Generating cache key', { endpoint, params });
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value.toString());
      }
    }

    logger.debug('Cache key generated', { key: url.toString() });
    return url.toString();
  }

  private getCachedData<T>(cacheKey: string): T | undefined {
    logger.debug('Getting cached data', { cacheKey });
    if (!this.cacheEnabled) {
      logger.debug('Cache disabled');
      return undefined;
    }

    const entry = this.cache.get(cacheKey) as CacheEntry<T> | undefined;
    if (!entry) {
      logger.debug('Cache entry not found', { cacheKey });
      return undefined;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(cacheKey);
      logger.debug('Cache entry expired', { cacheKey });
      return undefined;
    }

    logger.debug('Cache entry found', { cacheKey });
    return entry.data;
  }

  private async request<T>(endpoint: string, config: RequestConfig<T> = {}): Promise<T> {
    const { params, schema, ...init } = config;
    const isGetRequest = init.method === 'GET';
    logger.debug('Requesting', { endpoint, isGetRequest });
    // Add configurable delay in development mode
    if (isDevelopment) {
      const DELAY_MS = Number(import.meta.env.VITE_API_DELAY ?? 500);
      logger.debug('Adding delay', { DELAY_MS });
      await delay(DELAY_MS);
    }

    const url = new URL(`${this.baseURL}${endpoint}`);
    logger.debug('URL generated', { url: url.toString() });
    if (isGetRequest && params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.append(key, value);
        logger.debug('Added param', { key, value });
      }
    }

    const headers = new Headers(init.headers);
    logger.debug('Headers created', { headers: headers.toString() });
    if (!isGetRequest) {
      headers.set('X-CACHE-CONTROL', 'no-cache');
      logger.debug('Set X-CACHE-CONTROL to no-cache');
    }

    const token = this.getAuthToken();
    logger.debug('Token retrieved', { token });
    if (token) {
      logger.debug('Setting Authorization header', { token });
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && init.body) {
      logger.debug('Setting Content-Type header to application/json');
      headers.set('Content-Type', 'application/json');
    }

    this.buildNonceHeaders(headers);
    logger.debug('Nonce headers built', { headers: headers.toString() });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      logger.debug('Aborting request');
      controller.abort();
    }, this.timeout);

    try {
      const startTime = Date.now();
      logger.debug('Making request', { url: url.toString() });
      const response = await fetch(url.toString(), {
        ...init,
        headers,
        signal: controller.signal,
      });

      logger.debug('Response received', { response: response.toString() });
      clearTimeout(timeoutId);
      logger.debug('Timeout cleared');

      const data = await this.parseResponse(response);
      logger.debug('Data parsed', { data });
      if (!response.ok) {
        logger.error('Response not ok', { response: response.toString() });
        throw new ApiError(response.status, response.statusText, data);
      }

      logger.debug('Response ok', { response: response.toString() });
      {
        const elapsedTime = Date.now() - startTime;
        const waitPeriod = this.delayOnRequest - elapsedTime;
        if (waitPeriod > 0) {
          logger.debug('Request delayed', { waitPeriod });
          await delay(waitPeriod);
        }
      }

      if (schema) {
        // Validate response if schema provided
        logger.debug('Validating response...');
        const validatedData = this.validateResponse(schema, data);
        logger.debug('Response validated', { validatedData });
        return validatedData;
      }

      logger.debug('No schema provided, returning raw data', { data });
      return data as T;
    } catch (error) {
      logger.error('Request failed', error);
      clearTimeout(timeoutId);
      logger.debug('Timeout cleared');

      if (error instanceof ApiError) {
        logger.error('ApiError', { error });
        throw error;
      }

      if (error instanceof Error) {
        logger.error('Error', { error });
        if (error.name === 'AbortError') {
          logger.error('AbortError', { error });
          throw new ApiError(408, 'Request Timeout');
        }

        logger.error('Unknown error', { error });
        throw new ApiError(0, error.message);
      }

      logger.error('Unknown error occurred', { error });
      throw new ApiError(0, 'Unknown error occurred');
    }
  }

  private validateResponse<T>(schema: z.ZodSchema<T>, data: unknown) {
    try {
      logger.debug('Validating response...');
      const validatedData = schema.parse(data) as T;
      logger.debug('Response validated', { validatedData });
      return validatedData;
    } catch (error) {
      logger.error('Validation failed', { data, error: z.treeifyError(error as z.ZodError) });
      throw new ApiError(422, 'Invalid response format', {
        received: data,
        error: error instanceof Error ? error.message : 'Validation failed', // TODO: add zod errors
      });
    }
  }

  private async parseResponse(response: Response): Promise<unknown> {
    logger.debug('Parsing response...');
    const contentLength = response.headers.get('content-length');
    if (contentLength === '0' || response.status === 204) {
      logger.debug('Response is empty');
      return undefined;
    }
    const contentType = response.headers.get('content-type');
    logger.debug('Content type', { contentType });
    const hasJsonContent = contentType?.includes('application/json');
    logger.debug('Has JSON content', { hasJsonContent });
    const data = hasJsonContent ? await response.json() : undefined;
    logger.debug('Data parsed', { data });
    if (data && 'success' in data) {
      logger.debug('Data has success property', { data });
      return data.data ?? data.result ?? data;
    }
    logger.debug('Data does not have success property, returning undefined');
    return undefined;
  }

  private buildNonceHeaders(headers: Headers): void {
    const timestamp = Date.now().toString();
    const requestKey = Math.random().toString(16).slice(2);
    const nonce = this.generateNonce(timestamp, requestKey);
    if (nonce) {
      headers.set('X-UNIQ', requestKey);
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
