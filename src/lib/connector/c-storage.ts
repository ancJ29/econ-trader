import * as httpCaller from './internal-http-caller';

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_HOSTNAME = 'c-storage-cr3xk.api-bridge.work';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 30_000;

// ============================================================================
// Types
// ============================================================================

interface StorageOptions {
  ssl?: boolean;
  hostname?: string;
  serviceCode?: string;
  timeout?: number;
  maxRetries?: number;
  enableCircuitBreaker?: boolean;
}

interface CallOptions {
  path: `/${string}`;
  method?: 'GET' | 'POST' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  ignoreResponse?: boolean;
}

// Custom error types for better error handling
export class StorageError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class StorageNotFoundError extends StorageError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'StorageNotFoundError';
  }
}

export class StorageAuthError extends StorageError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401, 'AUTH_FAILED');
    this.name = 'StorageAuthError';
  }
}

export class StorageValidationError extends StorageError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'StorageValidationError';
  }
}

// ============================================================================
// Circuit Breaker
// ============================================================================

class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number,
    private timeout: number
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.timeout) {
        this.state = 'half-open';
      } else {
        throw new StorageError(
          'Circuit breaker is open - service temporarily unavailable',
          503,
          'CIRCUIT_OPEN'
        );
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      console.warn(`[StorageClient] Circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  getState(): string {
    return this.state;
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

function validateServiceId(serviceId: string): void {
  if (!serviceId || typeof serviceId !== 'string') {
    throw new StorageValidationError('serviceId must be a non-empty string');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(serviceId)) {
    throw new StorageValidationError(
      'serviceId must contain only alphanumeric characters, hyphens, and underscores'
    );
  }
  if (serviceId.length > 100) {
    throw new StorageValidationError('serviceId must be 100 characters or less');
  }
}

function validateKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new StorageValidationError('key must be a non-empty string');
  }
  if (key.length > 200) {
    throw new StorageValidationError('key must be 200 characters or less');
  }
}

function validateApiKey(apiKey: string): void {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new StorageValidationError('apiKey must be a non-empty string');
  }
  if (apiKey.length < 10) {
    throw new StorageValidationError('apiKey appears to be invalid (too short)');
  }
}

// ============================================================================
// Storage Client Class
// ============================================================================

export class StorageClient {
  private readonly url: string;
  private readonly maxRetries: number;
  private readonly circuitBreaker?: CircuitBreaker;

  constructor(options: StorageOptions = {}) {
    const hostname = options.hostname ?? DEFAULT_HOSTNAME;
    const ssl = options.ssl ?? true;
    this.url = `${ssl ? 'https' : 'http'}://${hostname}`;
    this.maxRetries = options.maxRetries ?? MAX_RETRIES;

    if (options.enableCircuitBreaker !== false) {
      this.circuitBreaker = new CircuitBreaker(CIRCUIT_BREAKER_THRESHOLD, CIRCUIT_BREAKER_TIMEOUT);
    }
  }

  // ==========================================================================
  // Public API
  // ==========================================================================

  async write(
    serviceId: string,
    apiKey: string,
    {
      key,
      data,
      description,
    }: {
      key: string;
      data: unknown;
      description?: string;
    }
  ): Promise<void> {
    validateServiceId(serviceId);
    validateKey(key);
    validateApiKey(apiKey);

    await this.call({
      ignoreResponse: true,
      path: `/api/storage/${serviceId}/${key}`,
      method: 'POST',
      body: description ? { data, description } : { data },
      headers: { 'x-api-key': apiKey },
    });
  }

  async writePrivate(
    serviceId: string,
    apiKey: string,
    {
      key,
      data,
      description,
    }: {
      key: string;
      data: unknown;
      description?: string;
    }
  ): Promise<void> {
    validateServiceId(serviceId);
    validateKey(key);
    validateApiKey(apiKey);

    await this.call({
      ignoreResponse: true,
      path: `/api/storage/${serviceId}/private/${key}`,
      method: 'POST',
      body: description ? { data, description } : { data },
      headers: { 'x-api-key': apiKey },
    });
  }

  async echo(): Promise<unknown> {
    return this.call({ path: '/echo' });
  }

  async alive(): Promise<boolean> {
    const res = await httpCaller.call(`${this.url}/health`, {
      uidPrefix: 'c-storage',
    });

    if (!res.ok) {
      throw new StorageError('Failed to validate hostname', res.status);
    }

    const data = await res.json();
    if (data.instanceName !== 'c-storage') {
      throw new StorageError('Invalid hostname - wrong service instance');
    }

    return true;
  }

  async getAll(serviceId: string): Promise<unknown> {
    validateServiceId(serviceId);
    return this.call({ path: `/api/storage/${serviceId}` });
  }

  async getAllPrivate(serviceId: string, apiKey: string): Promise<unknown> {
    validateServiceId(serviceId);
    validateApiKey(apiKey);

    return this.call({
      path: `/api/storage/${serviceId}/private`,
      headers: { 'x-api-key': apiKey },
    });
  }

  async get<T>(serviceId: string, key: string, defaultValue?: T): Promise<T | undefined> {
    validateServiceId(serviceId);
    validateKey(key);

    try {
      const res = await this.call<T>({ path: `/api/storage/${serviceId}/${key}` });
      return (res ?? defaultValue) as T;
    } catch (error) {
      // Only return default for 404, re-throw other errors
      if (error instanceof StorageNotFoundError) {
        return defaultValue;
      }
      throw error;
    }
  }

  async getMany<T>(serviceId: string, keys: string[], defaultValue?: T): Promise<T | undefined> {
    validateServiceId(serviceId);
    keys.forEach((key) => validateKey(key));

    try {
      return await this.call<T>({
        method: 'POST',
        path: `/api/storage/${serviceId}`,
        body: { keys },
      });
    } catch (error) {
      // Only return default for 404, re-throw other errors
      if (error instanceof StorageNotFoundError) {
        return defaultValue;
      }
      throw error;
    }
  }

  async getManyPrivate<T>(
    serviceId: string,
    keys: string[],
    apiKey: string
  ): Promise<T | undefined> {
    validateServiceId(serviceId);
    keys.forEach((key) => validateKey(key));
    validateApiKey(apiKey);

    return this.call({
      method: 'POST',
      path: `/api/storage/${serviceId}/private`,
      body: { keys },
      headers: { 'x-api-key': apiKey },
    });
  }

  async getPrivate<T>(
    serviceId: string,
    key: string,
    apiKey: string,
    defaultValue?: T
  ): Promise<T | undefined> {
    validateServiceId(serviceId);
    validateKey(key);
    validateApiKey(apiKey);

    try {
      return await this.call<T>({
        path: `/api/storage/${serviceId}/private/${key}`,
        headers: { 'x-api-key': apiKey },
      });
    } catch (error) {
      // Only return default for 404, re-throw other errors
      if (error instanceof StorageNotFoundError) {
        return defaultValue;
      }
      throw error;
    }
  }

  async remove(serviceId: string, key: string, apiKey: string): Promise<void> {
    validateServiceId(serviceId);
    validateKey(key);
    validateApiKey(apiKey);

    await this.call({
      ignoreResponse: true,
      path: `/api/storage/${serviceId}/${key}`,
      method: 'DELETE',
      headers: { 'x-api-key': apiKey },
    });
  }

  async removePrivate(serviceId: string, key: string, apiKey: string): Promise<void> {
    validateServiceId(serviceId);
    validateKey(key);
    validateApiKey(apiKey);

    await this.call({
      ignoreResponse: true,
      path: `/api/storage/${serviceId}/private/${key}`,
      method: 'DELETE',
      headers: { 'x-api-key': apiKey },
    });
  }

  /**
   * DANGEROUS: Clears all data for a service
   * Use with extreme caution
   */
  async clearAll(serviceId: string, apiKey: string): Promise<void> {
    validateServiceId(serviceId);
    validateApiKey(apiKey);

    console.warn(`[StorageClient] Clearing all data for service: ${serviceId}`);

    await this.call({
      ignoreResponse: true,
      path: `/api/storage/${serviceId}/clear`,
      method: 'DELETE',
      headers: { 'x-api-key': apiKey },
    });
  }

  // ==========================================================================
  // Internal Methods
  // ==========================================================================

  private async call<T>(options: CallOptions): Promise<T | undefined> {
    const execute = () => this.executeWithRetry<T>(options);

    if (this.circuitBreaker) {
      return this.circuitBreaker.execute(execute);
    }

    return execute();
  }

  private async executeWithRetry<T>(
    options: CallOptions,
    attempt: number = 0
  ): Promise<T | undefined> {
    try {
      return await this.executeRequest<T>(options);
    } catch (error) {
      // Don't retry on validation or auth errors
      if (
        error instanceof StorageValidationError ||
        error instanceof StorageAuthError ||
        error instanceof StorageNotFoundError
      ) {
        throw error;
      }

      // Retry on network/server errors
      if (attempt < this.maxRetries) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        console.warn(
          `[StorageClient] Request failed, retrying (${attempt + 1}/${this.maxRetries}) after ${delay}ms`,
          error
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry<T>(options, attempt + 1);
      }

      throw error;
    }
  }

  private async executeRequest<T>(options: CallOptions): Promise<T | undefined> {
    try {
      const res = await httpCaller.call(`${this.url}${options.path}`, {
        method: options.method ?? 'GET',
        headers: options.headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        uidPrefix: 'c-storage',
      });

      if (!res.ok) {
        await this.handleErrorResponse(res);
      }

      if (options.ignoreResponse === true) {
        return undefined as T;
      }

      return await this.parseResponse<T>(res);
    } catch (error) {
      if (error instanceof StorageError) {
        throw error;
      }

      // Network or other errors
      throw new StorageError(
        error instanceof Error ? error.message : 'Unknown error occurred',
        undefined,
        'NETWORK_ERROR'
      );
    }
  }

  private async handleErrorResponse(res: Response): Promise<never> {
    let errorMessage: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let errorData: any;

    try {
      errorData = await res.json();
      errorMessage = errorData?.error ?? res.statusText;
    } catch {
      errorMessage = res.statusText;
    }

    // Map status codes to specific error types
    if (res.status === 404) {
      throw new StorageNotFoundError(errorMessage);
    }

    if (res.status === 401 || res.status === 403) {
      throw new StorageAuthError(errorMessage);
    }

    if (res.status >= 400 && res.status < 500) {
      throw new StorageValidationError(errorMessage);
    }

    // 5xx errors
    throw new StorageError(errorMessage, res.status, 'SERVER_ERROR');
  }

  private async parseResponse<T>(res: Response): Promise<T | undefined> {
    const response = await res.json();
    // Handle standard success response format
    if (response.success === true) {
      return (response.data?.data ?? response.data) as T;
    }

    if (response.success === false) {
      return undefined;
    }

    // Return raw response if not standard format
    return response as T;
  }

  getUrl(): string {
    return this.url;
  }

  getCircuitBreakerState(): string | undefined {
    return this.circuitBreaker?.getState();
  }

  //==========================================================================
  // Deprecated Methods
  //==========================================================================
  /**
   * @deprecated Use write instead
   */
  async set(serviceId: string, key: string, apiKey: string, data: unknown): Promise<void> {
    await this.write(serviceId, apiKey, { key, data });
  }

  /**
   * @deprecated Use writePrivate instead
   */
  async setPrivate(serviceId: string, key: string, apiKey: string, data: unknown): Promise<void> {
    await this.writePrivate(serviceId, apiKey, { key, data });
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

/**
 * Default singleton instance for backward compatibility
 */
export const cStorageV3 = new StorageClient();
