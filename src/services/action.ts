import {
  actionApi,
  type Action as ApiAction,
  type CreateActionInput as ApiCreateActionInput,
  type UpdateActionInput as ApiUpdateActionInput,
  type ActionsResponse as ApiActionsResponse,
} from '@/lib/api/action';

// Re-export types from API layer
export type Action = ApiAction;
export type CreateActionInput = ApiCreateActionInput;
export type UpdateActionInput = ApiUpdateActionInput;
export type ActionsResponse = ApiActionsResponse;

// Service layer methods
export const actionService = {
  async getActions(eventCode?: string): Promise<ActionsResponse> {
    return actionApi.getActions(eventCode);
  },

  async createAction(input: CreateActionInput): Promise<Action> {
    return actionApi.createAction(input);
  },

  async updateAction(input: UpdateActionInput): Promise<Action> {
    return actionApi.updateAction(input);
  },

  async deleteAction(id: string): Promise<void> {
    return actionApi.deleteAction(id);
  },
};
