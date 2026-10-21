import type {ChatMessage, Conversation} from '../model/index.js';

const speaker = (message: ChatMessage): string => {
  if (message.role === 'user') return 'You';
  if (message.role === 'assistant')
    return message.model === undefined ? 'Assistant' : message.model;
  return 'System';
};

const body = (message: ChatMessage): string => message.content || `(${message.status})`;

export const conversationToText = (conversation: Conversation): string => {
  const lines = [conversation.title, '='.repeat(Math.max(3, conversation.title.length)), ''];
  if (conversation.systemPrompt !== undefined && conversation.systemPrompt !== '') {
    lines.push('System prompt:', conversation.systemPrompt, '');
  }
  for (const message of conversation.messages) {
    lines.push(`${speaker(message)}:`, body(message), '');
    if (message.error !== undefined) lines.push(`Error: ${message.error}`, '');
  }
  return `${lines.join('\n').trimEnd()}\n`;
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const conversationToHtml = (conversation: Conversation): string => {
  const title = escapeHtml(conversation.title);
  const sections: string[] = [];
  if (conversation.systemPrompt !== undefined && conversation.systemPrompt !== '') {
    sections.push(
      `<section class="system"><h2>System prompt</h2><pre>${escapeHtml(conversation.systemPrompt)}</pre></section>`,
    );
  }
  for (const message of conversation.messages) {
    const error =
      message.error === undefined ? '' : `<p class="error">${escapeHtml(message.error)}</p>`;
    sections.push(
      `<section class="${message.role}"><h2>${escapeHtml(speaker(message))}</h2><pre>${escapeHtml(body(message))}</pre>${error}</section>`,
    );
  }
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:48rem;margin:2rem auto;padding:0 1rem;line-height:1.5}
pre{white-space:pre-wrap;font:inherit;margin:0}
section{border-left:3px solid #888;padding:0 0 0 1rem;margin:1.5rem 0}
.user{border-color:#3b82f6}.assistant{border-color:#10b981}.error{color:#b91c1c}
h2{font-size:.85rem;text-transform:uppercase;letter-spacing:.05em;margin:0 0 .25rem}
</style>
</head>
<body>
<h1>${title}</h1>
${sections.join('\n')}
</body>
</html>
`;
};
