import type {ChatMessage, Conversation} from './types.js';

export const findMessage = (
  conversation: Conversation,
  messageId: string,
): ChatMessage | undefined => conversation.messages.find((message) => message.id === messageId);

export const lastUserMessage = (conversation: Conversation): ChatMessage | undefined =>
  conversation.messages.findLast((message) => message.role === 'user');

export const lastAssistantMessage = (conversation: Conversation): ChatMessage | undefined =>
  conversation.messages.findLast((message) => message.role === 'assistant');

export const messagesThrough = (
  conversation: Conversation,
  messageId: string,
): readonly ChatMessage[] => {
  const index = conversation.messages.findIndex((message) => message.id === messageId);
  return index === -1 ? conversation.messages : conversation.messages.slice(0, index + 1);
};
