export interface CliOptions {
  help: boolean;
  version: boolean;
  demo: boolean;
  plain: boolean;
  prompt?: string;
  loadPath?: string;
  model?: string;
  systemPrompt?: string;
  command: readonly string[];
}

export const helpText = `Relay Chat

Usage:
  relay-chat --demo
  relay-chat -- <model-command> [arguments]
  relay-chat --prompt <text> --plain -- <model-command>

Options:
  --demo             Use the built-in deterministic streaming model
  --plain            Print one response without the interactive interface
  --prompt <text>    Send an initial message
  --load <path>      Open a saved conversation
  --model <name>     Set the model label passed to the adapter
  --system <text>    Set the conversation system prompt
  -h, --help         Show this help
  -v, --version      Show the version

Model commands receive one JSON request on stdin and return JSON Lines chunks on stdout.
`;

const valueAfter = (arguments_: readonly string[], index: number, option: string): string => {
  const value = arguments_[index + 1];
  if (value === undefined || value.startsWith('-')) throw new Error(`${option} requires a value.`);
  return value;
};

export const parseCliOptions = (arguments_: readonly string[]): CliOptions => {
  const options: CliOptions = {help: false, version: false, demo: false, plain: false, command: []};
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === '--') return {...options, command: arguments_.slice(index + 1)};
    if (argument === '-h' || argument === '--help') options.help = true;
    else if (argument === '-v' || argument === '--version') options.version = true;
    else if (argument === '--demo') options.demo = true;
    else if (argument === '--plain') options.plain = true;
    else if (argument === '--prompt') {
      options.prompt = valueAfter(arguments_, index, '--prompt');
      index += 1;
    } else if (argument === '--load') {
      options.loadPath = valueAfter(arguments_, index, '--load');
      index += 1;
    } else if (argument === '--model') {
      options.model = valueAfter(arguments_, index, '--model');
      index += 1;
    } else if (argument === '--system') {
      options.systemPrompt = valueAfter(arguments_, index, '--system');
      index += 1;
    } else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
};
