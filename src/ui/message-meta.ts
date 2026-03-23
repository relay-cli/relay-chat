import type {ChatMessage} from '../model/index.js';

export const formatMessageMeta = (message: ChatMessage): string => {
  const parts: string[] = [];
  if (message.model !== undefined) parts.push(message.model);
  if (message.latencyMs !== undefined) parts.push(`${(message.latencyMs / 1000).toFixed(1)}s`);
  if (message.usage?.outputTokens !== undefined) parts.push(`${message.usage.outputTokens} tokens`);
  if (message.status !== 'complete') parts.push(message.status);
  return parts.join(' · ');
};
