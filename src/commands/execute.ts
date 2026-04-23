import {createConversation, estimateConversationTokens} from '../model/index.js';
import {defaultConversationPath, defaultExportPath, exportConversation, loadConversation, saveConversation} from '../persistence/index.js';
import type {ChatSession} from '../session/index.js';
import type {ChatStore} from '../store/index.js';
import {chatThemes} from '../ui/theme.js';
import type {SlashCommand} from './parse.js';

export interface CommandContext {
  store: ChatStore;
  session: ChatSession;
  cwd?: string;
  setHelp: (visible: boolean) => void;
  setTheme: (name: string) => void;
  onQuit: () => void;
}

const chosenPath = (command: SlashCommand): string | undefined => command.arguments[0];

export const executeSlashCommand = async (
  command: SlashCommand,
  context: CommandContext,
): Promise<void> => {
  const {store, session} = context;
  const conversation = store.getSnapshot().conversation;
  switch (command.name) {
    case 'help':
      context.setHelp(true);
      return;
    case 'new':
      if (session.isStreaming) throw new Error('Cancel the active reply before starting another conversation.');
      store.replaceConversation(createConversation({model: conversation.model, systemPrompt: conversation.systemPrompt}));
      store.setNotice('Started a new conversation.');
      return;
    case 'clear':
      store.clearMessages();
      store.setNotice('Conversation cleared.');
      return;
    case 'title':
      if (command.rest === '') throw new Error('Usage: /title <text>');
      store.setTitle(command.rest);
      store.setNotice('Conversation title updated.');
      return;
    case 'system':
      if (command.rest === '') throw new Error('Usage: /system <text|off>');
      store.setSystemPrompt(command.rest === 'off' ? undefined : command.rest);
      store.setNotice(command.rest === 'off' ? 'System prompt cleared.' : 'System prompt updated.');
      return;
    case 'model':
      if (command.rest === '') throw new Error('Usage: /model <name|off>');
      store.setModel(command.rest === 'off' ? undefined : command.rest);
      store.setNotice(command.rest === 'off' ? 'Model label cleared.' : `Model set to ${command.rest}.`);
      return;
    case 'save': {
      const path = chosenPath(command) ?? defaultConversationPath(conversation.title, context.cwd);
      await saveConversation(path, store.getSnapshot().conversation);
      store.setNotice(`Saved ${path}`);
      return;
    }
    case 'load': {
      const path = chosenPath(command);
      if (path === undefined) throw new Error('Usage: /load <path>');
      store.replaceConversation(await loadConversation(path));
      store.setNotice(`Loaded ${path}`);
      return;
    }
    case 'export': {
      const path = chosenPath(command) ?? defaultExportPath(conversation.title, context.cwd);
      await exportConversation(path, store.getSnapshot().conversation);
      store.setNotice(`Exported ${path}`);
      return;
    }
    case 'retry':
      await session.retry();
      return;
    case 'regenerate':
      await session.regenerate();
      return;
    case 'theme': {
      const name = chosenPath(command);
      if (name === undefined || !chatThemes.has(name)) throw new Error('Usage: /theme <relay|mono>');
      context.setTheme(name);
      store.setNotice(`Theme set to ${name}.`);
      return;
    }
    case 'stats':
      store.setNotice(`${conversation.messages.length} messages · approximately ${estimateConversationTokens(conversation.messages)} tokens`);
      return;
    case 'quit':
      context.onQuit();
      return;
    default:
      throw new Error(`Unknown command: /${command.name}. Try /help.`);
  }
};
