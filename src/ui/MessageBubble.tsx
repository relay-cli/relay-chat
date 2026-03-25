import {Box, Text} from 'ink';
import type {ChatMessage} from '../model/index.js';
import {MarkdownText} from './markdown/MarkdownText.js';
import {formatMessageMeta} from './message-meta.js';
import type {ChatTheme} from './theme.js';

export interface MessageBubbleProps {
  message: ChatMessage;
  theme: ChatTheme;
  selected?: boolean;
}

const roleLabel = (message: ChatMessage): string => {
  if (message.role === 'user') return 'YOU';
  if (message.role === 'assistant') return 'ASSISTANT';
  return 'SYSTEM';
};

export const MessageBubble = ({message, theme, selected = false}: MessageBubbleProps) => {
  const accent = message.role === 'user' ? theme.user : message.role === 'assistant' ? theme.assistant : theme.muted;
  const meta = formatMessageMeta(message);
  return (
    <Box flexDirection="column" borderStyle={selected ? 'double' : 'single'} borderColor={accent} paddingX={1} marginBottom={1}>
      <Box justifyContent="space-between">
        <Text bold color={accent}>{roleLabel(message)}</Text>
        {meta !== '' && <Text color={theme.muted}>{meta}</Text>}
      </Box>
      {message.content === '' && message.status === 'streaming' ? <Text color={theme.muted}>Thinking…</Text> : <MarkdownText source={message.content} theme={theme} />}
      {message.error !== undefined && <Text color={theme.danger}>{message.error}</Text>}
    </Box>
  );
};
