import { z } from 'zod';
import { BaseApiClient } from './base';
import { delay } from '@/utils/time';
import type { TradingMarket, TradingSymbol } from '@/types/account';

export const ActionSchema = z.object({
  id: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
  accountId: z.string(),
  market: z.string() as z.ZodType<TradingMarket>,
  triggerType: z.enum(['actual_vs_forecast', 'actual_vs_previous']),
  condition: z.enum(['greater', 'less']),
  instrument: z.string() as z.ZodType<TradingSymbol>,
  side: z.enum(['buy', 'sell']),
  quantity: z.number().positive(),
  orderType: z.enum(['market', 'limit']),
  limitPrice: z.number().positive().optional(),
  enabled: z.boolean(),
  createdAt: z.number(),
});

export const CreateActionSchema = ActionSchema.omit({ id: true, createdAt: true });
export const UpdateActionSchema = ActionSchema.partial().required({ id: true });
export const ActionsResponseSchema = z.array(ActionSchema);

export type Action = z.infer<typeof ActionSchema>;
export type CreateActionInput = z.infer<typeof CreateActionSchema>;
export type UpdateActionInput = z.infer<typeof UpdateActionSchema>;
export type ActionsResponse = z.infer<typeof ActionsResponseSchema>;

// In-memory storage for dummy data (production would use backend)
const actionsStore: Action[] = [];
let nextId = 1;

class ActionApiClient extends BaseApiClient {
  async getActions(eventCode?: string): Promise<ActionsResponse> {
    await delay(200);

    // In production: return this.get('/actions', { eventCode }, ActionsResponseSchema);

    // Filter by eventCode if provided
    const filtered = eventCode
      ? actionsStore.filter((action) => action.eventCode === eventCode)
      : actionsStore;

    return ActionsResponseSchema.parse(filtered);
  }

  async createAction(input: CreateActionInput): Promise<Action> {
    await delay(200);

    // In production: return this.post('/actions', input, ActionSchema);

    const action: Action = {
      ...input,
      id: `action-${nextId++}`,
      createdAt: Date.now(),
    };

    actionsStore.push(action);
    return ActionSchema.parse(action);
  }

  async updateAction(input: UpdateActionInput): Promise<Action> {
    await delay(200);

    // In production: return this.put(`/actions/${input.id}`, input, ActionSchema);

    const index = actionsStore.findIndex((a) => a.id === input.id);
    if (index === -1) {
      throw new Error(`Action with id "${input.id}" not found`);
    }

    const updated = { ...actionsStore[index], ...input };
    actionsStore[index] = updated;

    return ActionSchema.parse(updated);
  }

  async deleteAction(id: string): Promise<void> {
    await delay(200);

    // In production: return this.delete(`/actions/${id}`);

    const index = actionsStore.findIndex((a) => a.id === id);
    if (index === -1) {
      throw new Error(`Action with id "${id}" not found`);
    }

    actionsStore.splice(index, 1);
  }
}

export const actionApi = new ActionApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
