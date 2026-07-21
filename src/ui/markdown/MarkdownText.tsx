import {Box, Text} from 'ink';
import {parseMarkdownBlocks} from './parse-blocks.js';
import {CodeBlock} from './CodeBlock.js';
import {InlineText} from './InlineText.js';
import type {ChatTheme} from '../theme.js';

export interface MarkdownTextProps {
  source: string;
  theme: ChatTheme;
}

export const MarkdownText = ({source, theme}: MarkdownTextProps) => (
  <Box flexDirection="column">
    {parseMarkdownBlocks(source).map((block, index) => {
      if (block.type === 'code')
        return (
          <CodeBlock
            key={index}
            code={block.code}
            theme={theme}
            {...(block.language === undefined ? {} : {language: block.language})}
          />
        );
      if (block.type === 'heading')
        return (
          <Text key={index} bold color={theme.text}>
            {block.text}
          </Text>
        );
      if (block.type === 'quote')
        return (
          <Text key={index} color={theme.muted}>
            │ {block.text}
          </Text>
        );
      if (block.type === 'rule')
        return (
          <Text key={index} color={theme.rule}>
            ────────────────────────
          </Text>
        );
      if (block.type === 'list') {
        return (
          <Box key={index} flexDirection="column">
            {block.items.map((item, itemIndex) => (
              <Text key={itemIndex} color={theme.text}>
                {block.ordered ? `${itemIndex + 1}.` : '•'} {item}
              </Text>
            ))}
          </Box>
        );
      }
      return <InlineText key={index} source={block.text} theme={theme} />;
    })}
  </Box>
);
