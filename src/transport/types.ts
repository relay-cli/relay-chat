import type {ChatMessage, TokenUsage} from '../model/index.js';

export interface ChatRequest {
  conversationId: string;
  messages: readonly Pick<ChatMessage, 'role' | 'content'>[];
  systemPrompt?: string;
  model?: string;
}

export type ChatChunk =
  | {type: 'delta'; text: string}
  | {type: 'usage'; usage: TokenUsage}
  | {type: 'model'; model: string}
  | {type: 'done'};

export interface ChatTransport {
  readonly name: string;
  stream(request: ChatRequest, signal: AbortSignal): AsyncIterable<ChatChunk>;
}
