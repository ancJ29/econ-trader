import { accountService, type Account } from '@/services/account';
import type { AccountFormData, TradingMarket } from '@/types/account';
import { create } from 'zustand';

interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  isLoading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  selectAccount: (id: string | null) => Promise<void>;
  createAccount: (data: AccountFormData) => Promise<void>;
  updateAccount: (id: string, data: Partial<AccountFormData>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  toggleAccountStatus: (id: string) => Promise<void>;
  updateMarkets: (
    id: string,
    availableMarkets: Partial<Record<TradingMarket, string[]>>
  ) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  error: null,

  fetchAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountService.getAccounts();
      set({ accounts, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch accounts',
        isLoading: false,
      });
    }
  },

  selectAccount: async (id) => {
    if (id === null) {
      set({ selectedAccount: null });
      return;
    }

    // First try to find in existing accounts
    const existingAccount = get().accounts.find((acc) => acc.id === id);
    if (existingAccount) {
      set({ selectedAccount: existingAccount, isLoading: false, error: null });
    }

    // Then Fetch the latest data from the API and update the store
    try {
      set({ isLoading: true, error: null });
      // Fetch all accounts to populate the list
      const allAccounts = await accountService.getAccounts();

      // And fetch the latest data for the selected account
      const account = await accountService.getAccountById(id);

      set({
        accounts: allAccounts,
        selectedAccount: account,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch account',
        isLoading: false,
        selectedAccount: null,
      });
    }
  },

  createAccount: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await accountService.createAccount(data);
      const accounts = await accountService.getAccounts();
      set({ accounts, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create account',
        isLoading: false,
      });
      throw error;
    }
  },

  updateAccount: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      if (data.name) {
        await accountService.updateAccount(id, data.name);
        await get().fetchAccounts();
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update account',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteAccount: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await accountService.deleteAccount(id);
      set((state) => ({
        accounts: state.accounts.filter((acc) => acc.id !== id),
        selectedAccount: state.selectedAccount?.id === id ? null : state.selectedAccount,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete account',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleAccountStatus: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const account = get().accounts.find((acc) => acc.id === id);
      if (!account) {
        throw new Error('Account not found');
      }
      if (account?.isActive !== undefined) {
        await accountService.toggleAccountStatus(id, !account?.isActive);
        set((state) => ({
          accounts: state.accounts.map((acc) =>
            acc.id === id ? { ...acc, isActive: !acc.isActive } : acc
          ),
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to toggle account status',
        isLoading: false,
      });
      throw error;
    }
  },

  updateMarkets: async (id, availableMarkets) => {
    set({ isLoading: true, error: null });
    try {
      await accountService.updateMarkets(id, availableMarkets);
      const updatedAccount = await accountService.getAccountById(id);
      set((state) => ({
        accounts: state.accounts.map((acc) => (acc.id === id ? updatedAccount : acc)),
        selectedAccount: state.selectedAccount?.id === id ? updatedAccount : state.selectedAccount,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update markets',
        isLoading: false,
      });
      throw error;
    }
  },
}));
