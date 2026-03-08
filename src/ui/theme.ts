export interface ChatTheme {
  name: string;
  background: string;
  surface: string;
  rule: string;
  text: string;
  muted: string;
  user: string;
  assistant: string;
  danger: string;
  warning: string;
}

export const relayTheme: ChatTheme = {
  name: 'relay',
  background: '#080B0F',
  surface: '#111820',
  rule: '#34414D',
  text: '#E8EDF2',
  muted: '#84909C',
  user: '#48A8FF',
  assistant: '#FF8A3D',
  danger: '#FF4D5A',
  warning: '#F0C84B',
};

export const monoTheme: ChatTheme = {
  ...relayTheme,
  name: 'mono',
  user: '#E8EDF2',
  assistant: '#B8C0C8',
};

export const chatThemes = new Map([
  [relayTheme.name, relayTheme],
  [monoTheme.name, monoTheme],
]);
