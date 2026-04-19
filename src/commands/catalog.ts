export interface CommandDescription {
  name: string;
  usage: string;
  description: string;
}

export const commandCatalog: readonly CommandDescription[] = [
  {name: 'help', usage: '/help', description: 'Open the keyboard and command reference.'},
  {name: 'new', usage: '/new', description: 'Start an empty conversation.'},
  {name: 'clear', usage: '/clear', description: 'Remove every message from this conversation.'},
  {name: 'title', usage: '/title <text>', description: 'Change the conversation title.'},
  {name: 'system', usage: '/system <text|off>', description: 'Set or clear the system prompt.'},
  {name: 'model', usage: '/model <name|off>', description: 'Set or clear the model label.'},
  {name: 'save', usage: '/save [path]', description: 'Save the conversation as JSON.'},
  {name: 'load', usage: '/load <path>', description: 'Load a conversation JSON file.'},
  {name: 'export', usage: '/export [path]', description: 'Export the conversation as Markdown.'},
  {name: 'retry', usage: '/retry', description: 'Retry the last failed or cancelled reply.'},
  {name: 'regenerate', usage: '/regenerate', description: 'Replace the latest assistant reply.'},
  {name: 'theme', usage: '/theme <relay|mono>', description: 'Change the terminal palette.'},
  {name: 'stats', usage: '/stats', description: 'Show message and token estimates.'},
  {name: 'quit', usage: '/quit', description: 'Close Relay Chat.'},
];

export const commandNames = commandCatalog.map(({name}) => name);
