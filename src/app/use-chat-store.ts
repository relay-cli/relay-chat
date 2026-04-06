import {useSyncExternalStore} from 'react';
import type {ChatSnapshot} from '../model/index.js';
import type {ChatStore} from '../store/index.js';

export const useChatStore = (store: ChatStore): ChatSnapshot =>
  useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
