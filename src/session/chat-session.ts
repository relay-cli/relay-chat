import {
  createMessage,
  lastAssistantMessage,
  lastUserMessage,
  titleFromMessage,
} from '../model/index.js';
import type {TokenUsage} from '../model/index.js';
import type {ChatStore} from '../store/index.js';
import type {ChatRequest, ChatTransport} from '../transport/types.js';

export class ChatSession {
  readonly #store: ChatStore;
  #transport: ChatTransport;
  #activeController: AbortController | undefined;

  constructor(store: ChatStore, transport: ChatTransport) {
    this.#store = store;
    this.#transport = transport;
  }

  get isStreaming(): boolean {
    return this.#activeController !== undefined;
  }

  setTransport(transport: ChatTransport): void {
    if (this.isStreaming) throw new Error('Cancel the active reply before changing transport.');
    this.#transport = transport;
  }

  async send(content: string): Promise<void> {
    const trimmed = content.trim();
    if (trimmed === '') return;
    if (this.isStreaming) throw new Error('A reply is already streaming.');

    const conversation = this.#store.getSnapshot().conversation;
    if (conversation.messages.length === 0 && conversation.title === 'New conversation') {
      this.#store.setTitle(titleFromMessage(trimmed));
    }
    this.#store.addMessage(createMessage('user', trimmed));
    await this.#startAssistant();
  }

  cancel(): boolean {
    if (this.#activeController === undefined) return false;
    this.#activeController.abort(new Error('Reply cancelled by the user.'));
    return true;
  }

  async regenerate(): Promise<void> {
    if (this.isStreaming) throw new Error('A reply is already streaming.');
    const conversation = this.#store.getSnapshot().conversation;
    const assistant = lastAssistantMessage(conversation);
    if (assistant === undefined) throw new Error('There is no assistant reply to regenerate.');
    this.#store.truncateFrom(assistant.id);
    if (lastUserMessage(this.#store.getSnapshot().conversation) === undefined) {
      throw new Error('There is no user message to answer.');
    }
    await this.#startAssistant();
  }

  async retry(): Promise<void> {
    const assistant = lastAssistantMessage(this.#store.getSnapshot().conversation);
    if (assistant === undefined || !['error', 'cancelled'].includes(assistant.status)) {
      throw new Error('There is no failed or cancelled reply to retry.');
    }
    await this.regenerate();
  }

  async editAndResend(userMessageId: string, content: string): Promise<void> {
    if (this.isStreaming) throw new Error('A reply is already streaming.');
    const message = this.#store
      .getSnapshot()
      .conversation.messages.find((candidate) => candidate.id === userMessageId);
    if (message?.role !== 'user') throw new Error('Only user messages can be edited and resent.');
    this.#store.truncateFrom(userMessageId);
    await this.send(content);
  }

  async #startAssistant(): Promise<void> {
    const startedAt = Date.now();
    const conversation = this.#store.getSnapshot().conversation;
    const assistant = createMessage('assistant', '', {
      status: 'streaming',
      ...(conversation.model === undefined ? {} : {model: conversation.model}),
    });
    this.#store.addMessage(assistant);
    this.#store.setActiveAssistant(assistant.id);
    const controller = new AbortController();
    this.#activeController = controller;
    let usage: TokenUsage | undefined;

    const request: ChatRequest = {
      conversationId: conversation.id,
      messages: conversation.messages.map(({role, content}) => ({role, content})),
      ...(conversation.systemPrompt === undefined ? {} : {systemPrompt: conversation.systemPrompt}),
      ...(conversation.model === undefined ? {} : {model: conversation.model}),
    };

    try {
      for await (const chunk of this.#transport.stream(request, controller.signal)) {
        if (chunk.type === 'delta') this.#store.appendDelta(assistant.id, chunk.text);
        if (chunk.type === 'usage') usage = chunk.usage;
        if (chunk.type === 'model') {
          this.#store.updateMessage(assistant.id, (message) => ({...message, model: chunk.model}));
        }
      }
      this.#store.completeMessage(assistant.id, {
        ...(usage === undefined ? {} : {usage}),
        latencyMs: Date.now() - startedAt,
      });
    } catch (error) {
      if (controller.signal.aborted) this.#store.cancelMessage(assistant.id);
      else
        this.#store.failMessage(
          assistant.id,
          error instanceof Error ? error.message : String(error),
        );
    } finally {
      if (this.#activeController === controller) this.#activeController = undefined;
    }
  }
}
