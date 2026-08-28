# Examples

`jsonl-model.mjs` is a complete external model-command adapter. It reads the Relay Chat request from standard input and streams JSON Lines chunks to standard output.

Try it with:

```sh
npm run demo:command
```

Replace its deterministic response with a local model call or another inference client while preserving the same request and chunk protocol.
