import {useRef, useState} from 'react';
import {Box, Text, useInput} from 'ink';
import {deleteBackward, deleteForward, deleteWordBackward, insertText, moveCursor} from './draft.js';
import {DraftHistory} from './history.js';
import type {ChatTheme} from '../ui/theme.js';

export interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  editing?: boolean;
  theme: ChatTheme;
}

export const Composer = ({value, onChange, onSubmit, disabled = false, editing = false, theme}: ComposerProps) => {
  const [cursor, setCursor] = useState(value.length);
  const history = useRef(new DraftHistory());
  const update = (next: {value: string; cursor: number}): void => {
    onChange(next.value);
    setCursor(next.cursor);
  };

  useInput((input, key) => {
    if (disabled || key.ctrl || key.meta) return;
    const state = {value, cursor: Math.min(cursor, value.length)};
    if (key.return) {
      const normalized = value.trim();
      if (normalized !== '') {
        history.current.push(value);
        onSubmit(value);
        update({value: '', cursor: 0});
      }
      return;
    }
    if (key.backspace) return update(deleteBackward(state));
    if (key.delete) return update(deleteForward(state));
    if (key.leftArrow) return update(moveCursor(state, cursor - 1));
    if (key.rightArrow) return update(moveCursor(state, cursor + 1));
    if (key.upArrow && !value.includes('\n')) {
      const previous = history.current.previous(value);
      return update({value: previous, cursor: previous.length});
    }
    if (key.downArrow && !value.includes('\n')) {
      const next = history.current.next(value);
      return update({value: next, cursor: next.length});
    }
    if (input !== '') update(insertText(state, input));
  });

  const safeCursor = Math.min(cursor, value.length);
  const before = value.slice(0, safeCursor);
  const current = value[safeCursor] ?? ' ';
  const after = value.slice(safeCursor + (safeCursor < value.length ? 1 : 0));

  return (
    <Box borderStyle="single" borderColor={editing ? theme.warning : theme.user} paddingX={1} flexDirection="column">
      <Text color={editing ? theme.warning : theme.user}>{editing ? 'EDIT MESSAGE' : 'MESSAGE'}</Text>
      {value === '' && !disabled ? (
        <Text color={theme.muted}>Write a message…</Text>
      ) : (
        <Text color={disabled ? theme.muted : theme.text}>
          {before}<Text inverse={!disabled}>{current}</Text>{after}
        </Text>
      )}
      <Text color={theme.muted}>{disabled ? 'Reply streaming · Esc cancels' : 'Enter sends · Ctrl+J adds a line'}</Text>
    </Box>
  );
};

export {deleteWordBackward};
