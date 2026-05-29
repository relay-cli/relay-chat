export interface DraftState {
  value: string;
  cursor: number;
}

const clampCursor = (value: string, cursor: number): number =>
  Math.max(0, Math.min(cursor, value.length));

export const insertText = (state: DraftState, text: string): DraftState => ({
  value: `${state.value.slice(0, state.cursor)}${text}${state.value.slice(state.cursor)}`,
  cursor: state.cursor + text.length,
});

export const deleteBackward = (state: DraftState): DraftState => {
  if (state.cursor === 0) return state;
  return {
    value: `${state.value.slice(0, state.cursor - 1)}${state.value.slice(state.cursor)}`,
    cursor: state.cursor - 1,
  };
};

export const deleteForward = (state: DraftState): DraftState => {
  if (state.cursor >= state.value.length) return state;
  return {
    value: `${state.value.slice(0, state.cursor)}${state.value.slice(state.cursor + 1)}`,
    cursor: state.cursor,
  };
};

export const deleteWordBackward = (state: DraftState): DraftState => {
  const before = state.value.slice(0, state.cursor);
  const start = before.search(/\S+\s*$/);
  if (start === -1) return {...state, value: state.value.slice(state.cursor), cursor: 0};
  const prefix = state.value.slice(0, start);
  const suffix = state.value.slice(state.cursor).replace(/^\s+/, prefix.endsWith(' ') ? '' : ' ');
  return {
    value: `${prefix}${suffix}`,
    cursor: start,
  };
};

export const moveCursor = (state: DraftState, cursor: number): DraftState => ({
  ...state,
  cursor: clampCursor(state.value, cursor),
});
