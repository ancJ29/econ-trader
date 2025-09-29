import {
  accountApi,
  type AccountResponse as ApiAccountResponse,
  type AccountsResponse as ApiAccountsResponse,
} from '@/lib/api/account';
import type { AccountFormData, TradingMarket, TradingSymbol } from '@/types/account';

// Re-export types from API layer
// This allows frontend code to use stable types while API contract can change
export type Account = ApiAccountResponse;
export type AccountsResponse = ApiAccountsResponse;
export type { AccountFormData } from '@/types/account';

// Service layer methods
export const accountService = {
  async getAccounts(): Promise<AccountsResponse> {
    const response = await accountApi.getAccounts();
    // Future: Transform API response to frontend-optimized format here if needed
    return response;
  },

  async getAccountById(id: string): Promise<Account> {
    const response = await accountApi.getAccountById(id);
    // Future: Transform API response here if needed
    return response;
  },

  async createAccount(data: AccountFormData): Promise<Account> {
    const response = await accountApi.createAccount(data);
    // Future: Transform API response here if needed
    return response;
  },

  async updateAccount(id: string, data: Partial<AccountFormData>): Promise<Account> {
    const response = await accountApi.updateAccount(id, data);
    // Future: Transform API response here if needed
    return response;
  },

  async deleteAccount(id: string): Promise<void> {
    await accountApi.deleteAccount(id);
  },

  async toggleAccountStatus(id: string): Promise<Account> {
    const response = await accountApi.toggleAccountStatus(id);
    // Future: Transform API response here if needed
    return response;
  },

  async updateMarkets(
    id: string,
    availableMarkets: Partial<Record<TradingMarket, TradingSymbol[]>>
  ): Promise<Account> {
    const response = await accountApi.updateMarkets(id, availableMarkets);
    // Future: Transform API response here if needed
    return response;
  },
};
