import {randomUUID} from 'node:crypto';

export type IdFactory = () => string;

export const createId: IdFactory = () => randomUUID();
