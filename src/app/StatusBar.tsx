import {Box, Text} from 'ink';
import {estimateConversationTokens} from '../model/index.js';
import type {Conversation} from '../model/index.js';
import type {ChatTheme} from '../ui/theme.js';

export interface StatusBarProps {
  conversation: Conversation;
  streaming: boolean;
  offsetFromEnd: number;
  theme: ChatTheme;
}

export const StatusBar = ({conversation, streaming, offsetFromEnd, theme}: StatusBarProps) => (
  <Box justifyContent="space-between">
    <Text color={streaming ? theme.assistant : theme.muted}>
      {streaming ? 'streaming' : 'ready'} · {conversation.messages.length} messages · ~
      {estimateConversationTokens(conversation.messages)} tokens
    </Text>
    <Text color={theme.muted}>
      {offsetFromEnd > 0 ? `${offsetFromEnd} from latest · ` : ''}Ctrl+H help
    </Text>
  </Box>
);
