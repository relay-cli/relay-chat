import {createConversation} from '../model/create-conversation.js';
import type {ChatMessage, ChatSnapshot, Conversation, TokenUsage} from '../model/types.js';

export type ChatListener = () => void;

export class ChatStore {
  readonly #listeners = new Set<ChatListener>();
  #snapshot: ChatSnapshot;

  constructor(conversation: Conversation = createConversation()) {
    this.#snapshot = {conversation};
  }

  getSnapshot = (): ChatSnapshot => this.#snapshot;

  subscribe = (listener: ChatListener): (() => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  replaceConversation(conversation: Conversation): void {
    this.#set({conversation});
  }

  setNotice(notice?: string): void {
    this.#set({...this.#snapshot, ...(notice === undefined ? {} : {notice})});
  }

  clearNotice(): void {
    const {notice: _notice, ...snapshot} = this.#snapshot;
    this.#set(snapshot);
  }

  setTitle(title: string): void {
    this.#updateConversation({title});
  }

  setSystemPrompt(systemPrompt?: string): void {
    this.#updateConversation(systemPrompt === undefined ? {systemPrompt: undefined} : {systemPrompt});
  }

  setModel(model?: string): void {
    this.#updateConversation(model === undefined ? {model: undefined} : {model});
  }

  addMessage(message: ChatMessage): void {
    this.#updateConversation({messages: [...this.#snapshot.conversation.messages, message]});
  }

  setActiveAssistant(activeAssistantId?: string): void {
    const next: ChatSnapshot = {
      conversation: this.#snapshot.conversation,
      ...(activeAssistantId === undefined ? {} : {activeAssistantId}),
      ...(this.#snapshot.notice === undefined ? {} : {notice: this.#snapshot.notice}),
    };
    this.#set(next);
  }

  appendDelta(messageId: string, delta: string): void {
    this.updateMessage(messageId, (message) => ({
      ...message,
      content: message.content + delta,
      status: 'streaming',
    }));
  }

  completeMessage(messageId: string, details: {usage?: TokenUsage; latencyMs?: number} = {}): void {
    this.updateMessage(messageId, (message) => ({
      ...message,
      status: 'complete',
      ...(details.usage === undefined ? {} : {usage: details.usage}),
      ...(details.latencyMs === undefined ? {} : {latencyMs: details.latencyMs}),
    }));
    this.setActiveAssistant();
  }

  failMessage(messageId: string, error: string): void {
    this.updateMessage(messageId, (message) => ({...message, status: 'error', error}));
    this.setActiveAssistant();
  }

  cancelMessage(messageId: string): void {
    this.updateMessage(messageId, (message) => ({...message, status: 'cancelled'}));
    this.setActiveAssistant();
  }

  updateMessage(messageId: string, update: (message: ChatMessage) => ChatMessage): void {
    this.#updateConversation({
      messages: this.#snapshot.conversation.messages.map((message) =>
        message.id === messageId ? update(message) : message,
      ),
    });
  }

  truncateFrom(messageId: string): void {
    const index = this.#snapshot.conversation.messages.findIndex(
      (message) => message.id === messageId,
    );
    if (index === -1) return;
    this.#updateConversation({messages: this.#snapshot.conversation.messages.slice(0, index)});
    this.setActiveAssistant();
  }

  clearMessages(): void {
    this.#updateConversation({messages: []});
    this.setActiveAssistant();
  }

  #updateConversation(
    patch: Partial<Omit<Conversation, 'schemaVersion' | 'id' | 'createdAt' | 'updatedAt'>>,
  ): void {
    const conversation = {
      ...this.#snapshot.conversation,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.#set({...this.#snapshot, conversation});
  }

  #set(snapshot: ChatSnapshot): void {
    this.#snapshot = snapshot;
    for (const listener of this.#listeners) listener();
  }
}
