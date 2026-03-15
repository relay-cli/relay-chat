import {Text} from 'ink';
import {parseInline} from './parse-inline.js';
import type {ChatTheme} from '../theme.js';

export interface InlineTextProps {
  source: string;
  theme: ChatTheme;
}

export const InlineText = ({source, theme}: InlineTextProps) => (
  <Text color={theme.text}>
    {parseInline(source).map((token, index) => {
      if (token.type === 'strong') return <Text key={index} bold>{token.value}</Text>;
      if (token.type === 'emphasis') return <Text key={index} italic>{token.value}</Text>;
      if (token.type === 'code') return <Text key={index} color={theme.assistant}>{token.value}</Text>;
      if (token.type === 'link') return <Text key={index} color={theme.user} underline>{token.value} ({token.href})</Text>;
      return <Text key={index}>{token.value}</Text>;
    })}
  </Text>
);
