import {Box, Text} from 'ink';
import type {Conversation} from '../model/index.js';
import type {ChatTheme} from '../ui/theme.js';

export interface ChatHeaderProps {
  conversation: Conversation;
  transportName: string;
  theme: ChatTheme;
}

export const ChatHeader = ({conversation, transportName, theme}: ChatHeaderProps) => (
  <Box borderStyle="single" borderColor={theme.rule} paddingX={1} justifyContent="space-between">
    <Text>
      <Text bold color={theme.text}>
        RELAY CHAT
      </Text>
      <Text color={theme.muted}> · {conversation.title}</Text>
    </Text>
    <Text color={theme.muted}>{conversation.model ?? transportName}</Text>
  </Box>
);
