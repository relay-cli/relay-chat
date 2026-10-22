# Examples

`jsonl-model.mjs` is a complete external model-command adapter. It reads the Relay Chat request from standard input and streams JSON Lines chunks to standard output.

Try it with:

```sh
npm run demo:command
```

Replace its deterministic response with a local model call or another inference client while preserving the same request and chunk protocol.

## OpenAI-compatible servers

`openai-compatible-model.mjs` connects Relay Chat to any server with a streaming `/chat/completions` endpoint. It defaults to [Impossible Inference](https://github.com/impossibleG/impossible-inference) on `http://127.0.0.1:8080/v1`:

```sh
relay-chat -- node examples/openai-compatible-model.mjs
```

Configure it with environment variables:

| Variable                | Default                        |
| ----------------------- | ------------------------------ |
| `RELAY_OPENAI_BASE_URL` | `http://127.0.0.1:8080/v1`     |
| `RELAY_OPENAI_MODEL`    | `qwen2.5-0.5b-instruct-q4-k-m` |
| `RELAY_OPENAI_API_KEY`  | none; sent as a bearer token   |

A model set with `--model` or `/model` takes precedence over `RELAY_OPENAI_MODEL`. For Ollama, set `RELAY_OPENAI_BASE_URL=http://127.0.0.1:11434/v1` and choose an installed model.

## Impossible ReAct Agent

`react-agent-model.mjs` connects Relay Chat to the streaming HTTP API of [Impossible ReAct Agent](https://github.com/impossibleG/impossible-react-agent). Start the agent with `npm start -- --serve`, then run:

```sh
relay-chat -- node examples/react-agent-model.mjs
```

Set `RELAY_AGENT_URL` when the agent is not on `http://127.0.0.1:4141`.

The agent keeps its own memory for each thread, so the adapter sends only the newest user message and uses the Relay Chat conversation ID as the thread ID. Regenerating or editing a turn does not remove the earlier attempt from the agent's memory; start a new conversation for a clean thread.
