import { BaseApiClient } from './base';
import { delay } from '@/utils/time';
import { generateStableId } from '@/utils/seededRandom';
import { generateDummyAccounts } from './dummyAccounts';
import type { Account, AccountFormData } from '@/types/account';
import {
  AccountSchema,
  AccountsResponseSchema,
  AccountFormDataSchema,
  type AccountResponse,
  type AccountsResponse,
} from '@/lib/schemas/account';

// Re-export types from schemas
export type { AccountResponse, AccountsResponse } from '@/lib/schemas/account';

// In-memory storage for accounts (simulating database)
let accountsStorage: Account[] | null = null;

// Lazy initialization function for accounts
function getAccountsStorage(): Account[] {
  if (accountsStorage === null) {
    // Generate accounts on first access with deterministic data
    accountsStorage = [...generateDummyAccounts()];
  }
  return accountsStorage;
}

class AccountApiClient extends BaseApiClient {
  async getAccounts(): Promise<AccountsResponse> {
    // TODO: Replace with actual API call when backend is ready
    // return this.get('/accounts', undefined, AccountsResponseSchema);

    // Simulate API delay
    await delay(300);

    // Return accounts without secret keys
    const accountsWithoutSecrets = getAccountsStorage().map((account) => ({
      ...account,
      secretKey: undefined,
    }));

    return AccountsResponseSchema.parse(accountsWithoutSecrets);
  }

  async getAccountById(id: string): Promise<AccountResponse> {
    // TODO: Replace with actual API call when backend is ready
    // return this.get(`/accounts/${id}`, undefined, AccountSchema);

    // Simulate API delay
    await delay(200);

    const account = getAccountsStorage().find((acc) => acc.id === id);
    if (!account) {
      throw new Error('Account not found');
    }

    // Return account without secret key
    const accountWithoutSecret = {
      ...account,
      secretKey: undefined,
    };

    return AccountSchema.parse(accountWithoutSecret);
  }

  async createAccount(data: AccountFormData): Promise<AccountResponse> {
    // Validate input data
    const validatedData = AccountFormDataSchema.parse(data);

    // TODO: Replace with actual API call when backend is ready
    // return this.post('/accounts', validatedData, AccountSchema);

    // Simulate API delay
    await delay(500);

    const now = Date.now();
    const newAccount: Account = {
      id: generateStableId('account', getAccountsStorage().length),
      name: validatedData.name,
      exchange: validatedData.exchange,
      availableMarkets: {},
      apiKey: validatedData.apiKey,
      secretKey: validatedData.secretKey,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    getAccountsStorage().push(newAccount);

    // Return account without secret key
    const accountWithoutSecret = {
      ...newAccount,
      secretKey: undefined,
    };

    return AccountSchema.parse(accountWithoutSecret);
  }

  async updateAccount(id: string, data: Partial<AccountFormData>): Promise<AccountResponse> {
    // TODO: Replace with actual API call when backend is ready
    // return this.put(`/accounts/${id}`, data, AccountSchema);

    // Simulate API delay
    await delay(400);

    const accountIndex = getAccountsStorage().findIndex((acc) => acc.id === id);
    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    const updatedAccount: Account = {
      ...getAccountsStorage()[accountIndex],
      ...(data.name && { name: data.name }),
      ...(data.exchange && { exchange: data.exchange }),
      ...(data.apiKey && { apiKey: data.apiKey }),
      ...(data.secretKey && { secretKey: data.secretKey }),
      updatedAt: Date.now(),
    };

    getAccountsStorage()[accountIndex] = updatedAccount;

    // Return account without secret key
    const accountWithoutSecret = {
      ...updatedAccount,
      secretKey: undefined,
    };

    return AccountSchema.parse(accountWithoutSecret);
  }

  async deleteAccount(id: string): Promise<void> {
    // TODO: Replace with actual API call when backend is ready
    // return this.delete(`/accounts/${id}`);

    // Simulate API delay
    await delay(300);

    const accountIndex = getAccountsStorage().findIndex((acc) => acc.id === id);
    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    getAccountsStorage().splice(accountIndex, 1);
  }

  async toggleAccountStatus(id: string): Promise<AccountResponse> {
    // TODO: Replace with actual API call when backend is ready
    // return this.patch(`/accounts/${id}/toggle-status`, undefined, AccountSchema);

    // Simulate API delay
    await delay(300);

    const accountIndex = getAccountsStorage().findIndex((acc) => acc.id === id);
    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    const updatedAccount: Account = {
      ...getAccountsStorage()[accountIndex],
      isActive: !getAccountsStorage()[accountIndex].isActive,
      updatedAt: Date.now(),
    };

    getAccountsStorage()[accountIndex] = updatedAccount;

    // Return account without secret key
    const accountWithoutSecret = {
      ...updatedAccount,
      secretKey: undefined,
    };

    return AccountSchema.parse(accountWithoutSecret);
  }

  async updateMarkets(
    id: string,
    availableMarkets: Partial<Record<string, string[]>>
  ): Promise<AccountResponse> {
    // TODO: Replace with actual API call when backend is ready
    // return this.patch(`/accounts/${id}/markets`, { availableMarkets }, AccountSchema);

    // Simulate API delay
    await delay(300);

    const accountIndex = getAccountsStorage().findIndex((acc) => acc.id === id);
    if (accountIndex === -1) {
      throw new Error('Account not found');
    }

    const updatedAccount: Account = {
      ...getAccountsStorage()[accountIndex],
      availableMarkets,
      updatedAt: Date.now(),
    };

    getAccountsStorage()[accountIndex] = updatedAccount;

    // Return account without secret key
    const accountWithoutSecret = {
      ...updatedAccount,
      secretKey: undefined,
    };

    return AccountSchema.parse(accountWithoutSecret);
  }
}

export const accountApi = new AccountApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30_000,
  cacheEnabled: false, // Disable caching for account data
});

// Removed generateStableId('temp', 0) function - now using generateStableId() for deterministic IDs
