import {useEffect, useMemo, useState} from 'react';
import {Box, useInput} from 'ink';
import {Composer} from '../composer/Composer.js';
import {parseSlashCommand, executeSlashCommand} from '../commands/index.js';
import {createConversation, lastUserMessage} from '../model/index.js';
import {defaultConversationPath, saveConversation} from '../persistence/index.js';
import type {ChatSession} from '../session/index.js';
import type {ChatStore} from '../store/index.js';
import {MessageFeed} from '../ui/MessageFeed.js';
import {chatThemes, relayTheme} from '../ui/theme.js';
import {ChatHeader} from './ChatHeader.js';
import {HelpOverlay} from './HelpOverlay.js';
import {Notice} from './Notice.js';
import {StatusBar} from './StatusBar.js';
import {useChatStore} from './use-chat-store.js';
import {useTerminalSize} from './use-terminal-size.js';

export interface ChatAppProps {
  store: ChatStore;
  session: ChatSession;
  transportName: string;
  cwd?: string;
  onQuit?: () => void;
}

export const ChatApp = ({store, session, transportName, cwd, onQuit}: ChatAppProps) => {
  const snapshot = useChatStore(store);
  const terminal = useTerminalSize();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string>();
  const [offsetFromEnd, setOffsetFromEnd] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [themeName, setThemeName] = useState('relay');
  const theme = chatThemes.get(themeName) ?? relayTheme;
  const streaming = snapshot.activeAssistantId !== undefined;
  const visibleCount = useMemo(
    () => Math.max(1, Math.min(6, Math.floor((terminal.rows - 10) / 6))),
    [terminal.rows],
  );

  useEffect(() => {
    if (offsetFromEnd === 0) setOffsetFromEnd(0);
  }, [snapshot.conversation.messages.length, offsetFromEnd]);

  const quit = (): void => {
    if (streaming) session.cancel();
    onQuit?.();
  };

  const report = (action: Promise<void>): void => {
    void action.catch((error: unknown) => {
      store.setNotice(error instanceof Error ? error.message : String(error));
    });
  };

  const submit = (value: string): void => {
    store.clearNotice();
    const command = parseSlashCommand(value);
    if (command !== undefined) {
      report(
        executeSlashCommand(command, {
          store,
          session,
          setHelp: setShowHelp,
          setTheme: setThemeName,
          onQuit: quit,
          ...(cwd === undefined ? {} : {cwd}),
        }),
      );
      return;
    }
    const activeEdit = editingId;
    setEditingId(undefined);
    setOffsetFromEnd(0);
    report(
      activeEdit === undefined ? session.send(value) : session.editAndResend(activeEdit, value),
    );
  };

  useInput((input, key) => {
    if (key.escape) {
      if (showHelp) setShowHelp(false);
      else if (streaming) session.cancel();
      else if (editingId !== undefined) {
        setEditingId(undefined);
        setDraft('');
      }
      return;
    }
    if (key.pageUp)
      return setOffsetFromEnd((current) =>
        Math.min(snapshot.conversation.messages.length - 1, current + visibleCount),
      );
    if (key.pageDown) return setOffsetFromEnd((current) => Math.max(0, current - visibleCount));
    if (!key.ctrl) return;
    if (input === 'c') return quit();
    if (input === 'h') return setShowHelp((visible) => !visible);
    if (input === 'j' && !streaming) return setDraft((current) => `${current}\n`);
    if (input === 'e' && !streaming) {
      const message = lastUserMessage(snapshot.conversation);
      if (message !== undefined) {
        setEditingId(message.id);
        setDraft(message.content);
      }
      return;
    }
    if (input === 'r' && !streaming) return report(session.regenerate());
    if (input === 'y' && !streaming) return report(session.retry());
    if (input === 'n' && !streaming) {
      store.replaceConversation(
        createConversation({
          ...(snapshot.conversation.model === undefined
            ? {}
            : {model: snapshot.conversation.model}),
          ...(snapshot.conversation.systemPrompt === undefined
            ? {}
            : {systemPrompt: snapshot.conversation.systemPrompt}),
        }),
      );
      setDraft('');
      setEditingId(undefined);
      return;
    }
    if (input === 's') {
      const path = defaultConversationPath(snapshot.conversation.title, cwd);
      return report(
        saveConversation(path, snapshot.conversation).then(() => store.setNotice(`Saved ${path}`)),
      );
    }
  });

  return (
    <Box flexDirection="column">
      <ChatHeader
        conversation={snapshot.conversation}
        transportName={transportName}
        theme={theme}
      />
      <Box flexDirection="column" paddingY={1}>
        {showHelp ? (
          <HelpOverlay theme={theme} />
        ) : (
          <MessageFeed
            messages={snapshot.conversation.messages}
            visibleCount={visibleCount}
            offsetFromEnd={offsetFromEnd}
            theme={theme}
          />
        )}
      </Box>
      <Notice message={snapshot.notice} theme={theme} />
      <Composer
        value={draft}
        onChange={setDraft}
        onSubmit={submit}
        disabled={streaming || showHelp}
        editing={editingId !== undefined}
        theme={theme}
      />
      <StatusBar
        conversation={snapshot.conversation}
        streaming={streaming}
        offsetFromEnd={offsetFromEnd}
        theme={theme}
      />
    </Box>
  );
};
