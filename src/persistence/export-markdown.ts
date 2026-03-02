import type {ChatMessage, Conversation} from '../model/index.js';

const heading = (message: ChatMessage): string => {
  if (message.role === 'user') return 'You';
  if (message.role === 'assistant') return message.model === undefined ? 'Assistant' : message.model;
  return 'System';
};

export const conversationToMarkdown = (conversation: Conversation): string => {
  const lines = [`# ${conversation.title}`, ''];
  if (conversation.systemPrompt !== undefined && conversation.systemPrompt !== '') {
    lines.push('## System prompt', '', conversation.systemPrompt, '');
  }
  for (const message of conversation.messages) {
    lines.push(`## ${heading(message)}`, '', message.content || `_${message.status}_`, '');
    if (message.error !== undefined) lines.push(`> ${message.error.replace(/\n/g, '\n> ')}`, '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
};
