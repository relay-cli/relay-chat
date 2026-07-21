#!/usr/bin/env node

import {createConversation} from './model/index.js';
import {loadConversation} from './persistence/index.js';
import {ChatSession} from './session/index.js';
import {ChatStore} from './store/index.js';
import {CommandTransport, EchoTransport} from './transport/index.js';
import type {ChatTransport} from './transport/index.js';
import {runInteractive} from './cli/interactive.js';
import {helpText, parseCliOptions} from './cli/options.js';
import {runPlainPrompt} from './cli/plain.js';
import {relayChatVersion} from './version.js';

const main = async (): Promise<void> => {
  let options;
  try {
    options = parseCliOptions(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n\n${helpText}`,
    );
    process.exitCode = 2;
    return;
  }
  if (options.help) return void process.stdout.write(helpText);
  if (options.version) return void process.stdout.write(`${relayChatVersion}\n`);
  if (!options.demo && options.command.length === 0) {
    process.stderr.write(`Choose --demo or provide a model command after --.\n\n${helpText}`);
    process.exitCode = 2;
    return;
  }

  const loaded =
    options.loadPath === undefined ? undefined : await loadConversation(options.loadPath);
  const conversation =
    loaded ??
    createConversation({
      ...(options.model === undefined ? {} : {model: options.model}),
      ...(options.systemPrompt === undefined ? {} : {systemPrompt: options.systemPrompt}),
    });
  const store = new ChatStore(conversation);
  const transport: ChatTransport = options.demo
    ? new EchoTransport()
    : new CommandTransport({command: options.command});
  const session = new ChatSession(store, transport);

  if (options.plain || process.stdout.isTTY !== true || process.stdin.isTTY !== true) {
    if (options.prompt === undefined) {
      process.stderr.write('--prompt is required outside the interactive interface.\n');
      process.exitCode = 2;
      return;
    }
    process.exitCode = await runPlainPrompt(store, session, options.prompt);
    return;
  }

  process.exitCode = await runInteractive({
    store,
    session,
    transportName: transport.name,
    ...(options.prompt === undefined ? {} : {initialPrompt: options.prompt}),
  });
};

await main();
