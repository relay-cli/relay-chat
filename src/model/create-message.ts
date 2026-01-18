import {createId, type IdFactory} from './ids.js';
import type {ChatMessage, MessageRole, MessageStatus} from './types.js';

export interface CreateMessageOptions {
  id?: string;
  status?: MessageStatus;
  model?: string;
  now?: Date;
  idFactory?: IdFactory;
}

export const createMessage = (
  role: MessageRole,
  content: string,
  options: CreateMessageOptions = {},
): ChatMessage => ({
  id: options.id ?? (options.idFactory ?? createId)(),
  role,
  content,
  createdAt: (options.now ?? new Date()).toISOString(),
  status: options.status ?? 'complete',
  ...(options.model === undefined ? {} : {model: options.model}),
});
