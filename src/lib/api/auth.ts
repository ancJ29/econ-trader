import { z } from 'zod';
import { BaseApiClient } from './base';

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  clientServiceId: z.string(),
});

export const RegisterResponseSchema = z.object({
  success: z.boolean(),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  clientServiceId: z.string(),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  refreshToken: z.string(),
});

export const RenewAccessTokenSchema = z.object({
  refreshToken: z.string(),
});

export const RenewAccessTokenResponseSchema = z.object({
  token: z.string(),
});

export const VerifyTokenSchema = z.object({
  token: z.string(),
});

export const VerifyTokenResponseSchema = z.object({
  userId: z.string(),
  email: z.email(),
});

export type Register = z.infer<typeof RegisterSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type Login = z.infer<typeof LoginSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RenewAccessToken = z.infer<typeof RenewAccessTokenSchema>;
export type RenewAccessTokenResponse = z.infer<typeof RenewAccessTokenResponseSchema>;
export type VerifyToken = z.infer<typeof VerifyTokenSchema>;
export type VerifyTokenResponse = z.infer<typeof VerifyTokenResponseSchema>;

export default class AuthApiClient extends BaseApiClient {
  /**
   * Register a new user
   * @param input - The register input
   * @returns The register response
   */
  async register(input: Register): Promise<RegisterResponse> {
    return this.post('/api/sso/register', input, RegisterResponseSchema, RegisterSchema);
  }

  /**
   * Login a user
   * @param input - The login input
   * @returns The login response
   */
  async login(input: Login): Promise<LoginResponse> {
    return this.post('/api/sso/login', input, LoginResponseSchema, LoginSchema);
  }

  /**
   * Renew an access token
   * @param input - The renew access token input
   * @returns The renew access token response
   */
  async renewAccessToken(input: RenewAccessToken): Promise<RenewAccessTokenResponse> {
    return this.post(
      '/api/sso/renew-access-token',
      input,
      RenewAccessTokenResponseSchema,
      RenewAccessTokenSchema
    );
  }

  /**
   * Verify a token
   * @param input - The verify token input
   * @returns The verify token response
   */
  async verifyToken(input: VerifyToken): Promise<VerifyTokenResponse> {
    return this.post('/api/sso/verify-token', input, VerifyTokenResponseSchema, VerifyTokenSchema);
  }
}

export const authApi = new AuthApiClient({
  baseURL: 'https://c-sso-gc2uw.api-bridge.work',
  cacheEnabled: false,
});
