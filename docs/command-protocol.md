# Model command protocol

Relay Chat can start any local command that exchanges one request and a streamed response over standard input and output.

The command receives one JSON object followed by a newline:

```json
{
  "conversationId": "4a39...",
  "messages": [{"role": "user", "content": "Hello"}],
  "systemPrompt": "Answer briefly.",
  "model": "local-model"
}
```

The command writes JSON Lines. Each line is one of:

```json
{"type":"delta","text":"Hello "}
{"type":"delta","text":"there."}
{"type":"model","model":"local-model"}
{"type":"usage","usage":{"inputTokens":8,"outputTokens":3}}
{"type":"done"}
```

To fail the turn deliberately, write `{"type":"error","message":"..."}`. Diagnostic output belongs on standard error. Relay Chat displays the final standard-error tail when a command exits unsuccessfully.

Commands are started without a shell. On Windows, `.cmd` and `.bat` launchers are resolved explicitly. Cancelling a reply terminates the command process tree.
