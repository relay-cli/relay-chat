import type {ChatStore} from '../store/index.js';
import {saveConversation} from './file-store.js';

export interface AutosaveOptions {
  delayMs?: number;
  onError?: (error: unknown) => void;
}

export const enableAutosave = (
  store: ChatStore,
  path: string,
  options: AutosaveOptions = {},
): (() => Promise<void>) => {
  const delayMs = options.delayMs ?? 300;
  let timer: NodeJS.Timeout | undefined;
  let pending = Promise.resolve();
  let stopped = false;

  const schedule = (): void => {
    if (stopped) return;
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => {
      const conversation = store.getSnapshot().conversation;
      pending = pending
        .then(() => saveConversation(path, conversation))
        .catch((error: unknown) => options.onError?.(error));
    }, delayMs);
  };

  const unsubscribe = store.subscribe(schedule);
  return async () => {
    stopped = true;
    unsubscribe();
    if (timer !== undefined) clearTimeout(timer);
    await pending;
  };
};
