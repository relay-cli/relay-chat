import {Box, Text} from 'ink';
import type {ChatMessage} from '../model/index.js';
import {MessageBubble} from './MessageBubble.js';
import {messageWindow} from './message-window.js';
import type {ChatTheme} from './theme.js';

export interface MessageFeedProps {
  messages: readonly ChatMessage[];
  visibleCount: number;
  offsetFromEnd: number;
  selectedId?: string;
  theme: ChatTheme;
}

export const MessageFeed = ({
  messages,
  visibleCount,
  offsetFromEnd,
  selectedId,
  theme,
}: MessageFeedProps) => {
  const visible = messageWindow(messages, visibleCount, offsetFromEnd);
  if (visible.length === 0) return <Text color={theme.muted}>Start a conversation below.</Text>;
  return (
    <Box flexDirection="column">
      {visible[0] !== messages[0] && <Text color={theme.muted}>↑ earlier messages</Text>}
      {visible.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          theme={theme}
          selected={message.id === selectedId}
        />
      ))}
      {visible.at(-1) !== messages.at(-1) && <Text color={theme.muted}>↓ newer messages</Text>}
    </Box>
  );
};
