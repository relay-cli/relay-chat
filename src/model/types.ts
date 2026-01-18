export type MessageRole = 'system' | 'user' | 'assistant';
export type MessageStatus = 'complete' | 'streaming' | 'error' | 'cancelled';

export interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  status: MessageStatus;
  model?: string;
  error?: string;
  usage?: TokenUsage;
  latencyMs?: number;
}

export interface Conversation {
  schemaVersion: 1;
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  systemPrompt?: string;
  model?: string;
  messages: readonly ChatMessage[];
}

export interface ChatSnapshot {
  conversation: Conversation;
  activeAssistantId?: string;
  notice?: string;
}
