import {spawnSync} from 'node:child_process';
import {extname} from 'node:path';

export interface PreparedCommand {
  executable: string;
  arguments: string[];
  windowsVerbatimArguments?: boolean;
}

const scriptExtensions = new Set(['.cmd', '.bat']);

const quoteForCommandPrompt = (value: string): string => {
  const escaped = value.replace(/%/g, '%%').replace(/["^&|<>()]/g, '^$&');
  return `"${escaped}"`;
};

const resolveOnWindows = (executable: string): string => {
  if (extname(executable) !== '') return executable;
  const result = spawnSync('where.exe', [executable], {encoding: 'utf8', windowsHide: true});
  if (result.status !== 0) return executable;
  const candidates = result.stdout
    .split(/\r?\n/)
    .map((candidate) => candidate.trim())
    .filter(Boolean);
  return (
    candidates.find((candidate) => ['.exe', '.com'].includes(extname(candidate).toLowerCase())) ??
    candidates.find((candidate) => scriptExtensions.has(extname(candidate).toLowerCase())) ??
    executable
  );
};

export const prepareCommand = (command: readonly string[]): PreparedCommand => {
  const [requestedExecutable, ...arguments_] = command;
  if (requestedExecutable === undefined) throw new Error('A model command is required.');
  if (process.platform !== 'win32') return {executable: requestedExecutable, arguments: arguments_};

  const resolved = resolveOnWindows(requestedExecutable);
  if (!scriptExtensions.has(extname(resolved).toLowerCase())) {
    return {executable: resolved, arguments: arguments_};
  }
  const line = `call ${[resolved, ...arguments_].map(quoteForCommandPrompt).join(' ')}`;
  return {
    executable: process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe',
    arguments: ['/d', '/c', line],
    windowsVerbatimArguments: true,
  };
};
