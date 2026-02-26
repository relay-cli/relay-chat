import {assertConversation} from '../model/index.js';
import type {Conversation} from '../model/index.js';

export const serializeConversation = (conversation: Conversation): string =>
  `${JSON.stringify(conversation, null, 2)}\n`;

export const parseConversation = (source: string): Conversation => {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    throw new Error(
      `Conversation JSON could not be parsed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return assertConversation(value);
};
