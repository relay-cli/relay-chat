import {Box, Text} from 'ink';
import type {ChatTheme} from '../theme.js';

export interface CodeBlockProps {
  code: string;
  language?: string;
  theme: ChatTheme;
}

export const CodeBlock = ({code, language, theme}: CodeBlockProps) => (
  <Box flexDirection="column" borderStyle="single" borderColor={theme.rule} paddingX={1}>
    {language !== undefined && <Text color={theme.muted}>{language}</Text>}
    <Text color={theme.text}>{code}</Text>
  </Box>
);
