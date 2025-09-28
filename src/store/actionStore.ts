import { create } from 'zustand';
import {
  actionService,
  type Action,
  type CreateActionInput,
  type UpdateActionInput,
} from '@/services/action';

interface ActionState {
  actions: Action[];
  isLoading: boolean;
  error: string | null;
  fetchActions: (eventCode?: string) => Promise<void>;
  createAction: (input: CreateActionInput) => Promise<void>;
  updateAction: (input: UpdateActionInput) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  toggleEnabled: (id: string) => Promise<void>;
}

export const useActionStore = create<ActionState>((set, get) => ({
  actions: [],
  isLoading: false,
  error: null,

  fetchActions: async (eventCode?: string) => {
    set({ isLoading: true, error: null });
    try {
      const actions = await actionService.getActions(eventCode);
      set({ actions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch actions',
        isLoading: false,
      });
    }
  },

  createAction: async (input: CreateActionInput) => {
    set({ isLoading: true, error: null });
    try {
      const newAction = await actionService.createAction(input);
      set((state) => ({
        actions: [...state.actions, newAction],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create action',
        isLoading: false,
      });
      throw error;
    }
  },

  updateAction: async (input: UpdateActionInput) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await actionService.updateAction(input);
      set((state) => ({
        actions: state.actions.map((a) => (a.id === updated.id ? updated : a)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update action',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteAction: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await actionService.deleteAction(id);
      set((state) => ({
        actions: state.actions.filter((a) => a.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete action',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleEnabled: async (id: string) => {
    const action = get().actions.find((a) => a.id === id);
    if (!action) return;

    await get().updateAction({ id, enabled: !action.enabled });
  },
}));
