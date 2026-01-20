import {createId, type IdFactory} from './ids.js';
import type {Conversation} from './types.js';

export interface CreateConversationOptions {
  id?: string;
  title?: string;
  systemPrompt?: string;
  model?: string;
  now?: Date;
  idFactory?: IdFactory;
}

export const createConversation = (options: CreateConversationOptions = {}): Conversation => {
  const timestamp = (options.now ?? new Date()).toISOString();
  return {
    schemaVersion: 1,
    id: options.id ?? (options.idFactory ?? createId)(),
    title: options.title ?? 'New conversation',
    createdAt: timestamp,
    updatedAt: timestamp,
    messages: [],
    ...(options.systemPrompt === undefined ? {} : {systemPrompt: options.systemPrompt}),
    ...(options.model === undefined ? {} : {model: options.model}),
  };
};
