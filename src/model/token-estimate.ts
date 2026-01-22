export const estimateTokens = (text: string): number => {
  const normalized = text.trim();
  if (normalized === '') return 0;
  return Math.max(1, Math.ceil(normalized.length / 4));
};

export const estimateConversationTokens = (messages: readonly {content: string}[]): number =>
  messages.reduce((total, message) => total + estimateTokens(message.content) + 4, 0);
