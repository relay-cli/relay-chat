import {render} from 'ink';
import {ChatApp} from '../app/index.js';
import type {ChatSession} from '../session/index.js';
import type {ChatStore} from '../store/index.js';

export interface InteractiveOptions {
  store: ChatStore;
  session: ChatSession;
  transportName: string;
  initialPrompt?: string;
  cwd?: string;
}

export const runInteractive = async (options: InteractiveOptions): Promise<number> => {
  let close: (() => void) | undefined;
  const closed = new Promise<void>((resolve) => {
    close = resolve;
  });
  const app = render(
    <ChatApp
      store={options.store}
      session={options.session}
      transportName={options.transportName}
      onQuit={() => close?.()}
      {...(options.cwd === undefined ? {} : {cwd: options.cwd})}
    />,
    {exitOnCtrlC: false},
  );
  const interrupt = (): void => close?.();
  process.once('SIGINT', interrupt);
  if (options.initialPrompt !== undefined) {
    void options.session.send(options.initialPrompt);
  }
  await closed;
  options.session.cancel();
  app.unmount();
  process.off('SIGINT', interrupt);
  return 0;
};
