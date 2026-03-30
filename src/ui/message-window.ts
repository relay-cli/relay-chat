import type {ChatMessage} from '../model/index.js';

export const messageWindow = (
  messages: readonly ChatMessage[],
  count: number,
  offsetFromEnd: number,
): readonly ChatMessage[] => {
  const safeCount = Math.max(1, count);
  const safeOffset = Math.max(0, Math.min(offsetFromEnd, Math.max(0, messages.length - 1)));
  const end = Math.max(0, messages.length - safeOffset);
  const start = Math.max(0, end - safeCount);
  return messages.slice(start, end);
};
