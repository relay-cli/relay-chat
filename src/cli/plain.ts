import {lastAssistantMessage} from '../model/index.js';
import type {ChatSession} from '../session/index.js';
import type {ChatStore} from '../store/index.js';

export const runPlainPrompt = async (
  store: ChatStore,
  session: ChatSession,
  prompt: string,
  output: NodeJS.WritableStream = process.stdout,
): Promise<number> => {
  await session.send(prompt);
  const assistant = lastAssistantMessage(store.getSnapshot().conversation);
  if (assistant === undefined) {
    output.write('No assistant reply was produced.\n');
    return 1;
  }
  output.write(`${assistant.content}\n`);
  if (assistant.status === 'error') {
    if (assistant.error !== undefined) output.write(`Error: ${assistant.error}\n`);
    return 1;
  }
  return assistant.status === 'cancelled' ? 130 : 0;
};
