import {Text} from 'ink';
import type {ChatTheme} from '../ui/theme.js';

export const Notice = ({message, theme}: {message?: string; theme: ChatTheme}) =>
  message === undefined ? null : <Text color={theme.warning}>{message}</Text>;
