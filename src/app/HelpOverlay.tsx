import {Box, Text} from 'ink';
import type {ChatTheme} from '../ui/theme.js';

export const HelpOverlay = ({theme}: {theme: ChatTheme}) => (
  <Box flexDirection="column" borderStyle="double" borderColor={theme.user} paddingX={2}>
    <Text bold color={theme.text}>
      Keyboard
    </Text>
    <Text color={theme.text}>Enter send message</Text>
    <Text color={theme.text}>Ctrl+J insert newline</Text>
    <Text color={theme.text}>↑ / ↓ browse input history</Text>
    <Text color={theme.text}>PgUp/PgDn browse conversation</Text>
    <Text color={theme.text}>Esc cancel streamed reply</Text>
    <Text color={theme.text}>Ctrl+E edit and resend the latest user message</Text>
    <Text color={theme.text}>Ctrl+R regenerate the latest reply</Text>
    <Text color={theme.text}>Ctrl+Y retry a failed reply</Text>
    <Text color={theme.text}>Ctrl+S save conversation</Text>
    <Text color={theme.text}>Ctrl+N start a new conversation</Text>
    <Text color={theme.text}>Ctrl+G toggle this reference</Text>
    <Text color={theme.text}>Ctrl+C cancel or quit</Text>
    <Text color={theme.muted}>
      Slash commands: /help /new /title /system /model /save /load /export /retry /regenerate /theme
      /quit
    </Text>
  </Box>
);
