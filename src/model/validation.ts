import type {ChatMessage, Conversation, MessageRole, MessageStatus} from './types.js';

const roles = new Set<MessageRole>(['system', 'user', 'assistant']);
const statuses = new Set<MessageStatus>(['complete', 'streaming', 'error', 'cancelled']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isChatMessage = (value: unknown): value is ChatMessage =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  roles.has(value.role as MessageRole) &&
  typeof value.content === 'string' &&
  typeof value.createdAt === 'string' &&
  statuses.has(value.status as MessageStatus);

export const isConversation = (value: unknown): value is Conversation =>
  isRecord(value) &&
  value.schemaVersion === 1 &&
  typeof value.id === 'string' &&
  typeof value.title === 'string' &&
  typeof value.createdAt === 'string' &&
  typeof value.updatedAt === 'string' &&
  Array.isArray(value.messages) &&
  value.messages.every(isChatMessage);

export const assertConversation = (value: unknown): Conversation => {
  if (!isConversation(value)) {
    throw new Error('The file does not contain a supported Relay Chat conversation.');
  }
  return value;
};
