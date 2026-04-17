export interface SlashCommand {
  name: string;
  arguments: readonly string[];
  rest: string;
}

const tokenize = (source: string): string[] => {
  const values: string[] = [];
  const pattern = /"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'|(\S+)/g;
  for (const match of source.matchAll(pattern)) {
    values.push((match[1] ?? match[2] ?? match[3] ?? '').replace(/\\([\\"'])/g, '$1'));
  }
  return values;
};

export const parseSlashCommand = (input: string): SlashCommand | undefined => {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return undefined;
  const firstSpace = trimmed.search(/\s/);
  const name = trimmed.slice(1, firstSpace === -1 ? undefined : firstSpace).toLowerCase();
  const rest = firstSpace === -1 ? '' : trimmed.slice(firstSpace).trim();
  return {name, arguments: tokenize(rest), rest};
};
