import { create } from 'zustand';
import { accountService, type Account, type AccountFormData } from '@/services/account';
import type { TradingMarket, TradingSymbol } from '@/types/account';

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
    availableMarkets: Partial<Record<TradingMarket, TradingSymbol[]>>
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
      set({ selectedAccount: existingAccount });
      return;
    }

    // If not found and we haven't loaded accounts yet, try to fetch the specific account
    try {
      set({ isLoading: true, error: null });
      const account = await accountService.getAccountById(id);

      // Also fetch all accounts to populate the list
      const allAccounts = await accountService.getAccounts();

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
      const newAccount = await accountService.createAccount(data);
      set((state) => ({
        accounts: [...state.accounts, newAccount],
        isLoading: false,
      }));
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
      const updatedAccount = await accountService.updateAccount(id, data);
      set((state) => ({
        accounts: state.accounts.map((acc) => (acc.id === id ? updatedAccount : acc)),
        selectedAccount: state.selectedAccount?.id === id ? updatedAccount : state.selectedAccount,
        isLoading: false,
      }));
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
      const updatedAccount = await accountService.toggleAccountStatus(id);
      set((state) => ({
        accounts: state.accounts.map((acc) => (acc.id === id ? updatedAccount : acc)),
        selectedAccount: state.selectedAccount?.id === id ? updatedAccount : state.selectedAccount,
        isLoading: false,
      }));
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
      const updatedAccount = await accountService.updateMarkets(id, availableMarkets);
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
