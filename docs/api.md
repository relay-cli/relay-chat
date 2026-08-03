# Package API

`@relay-cli/chat` exports the complete interface as well as the underlying conversation pieces.

## Interface

- `ChatApp` renders the complete interactive application.
- `MessageFeed` and `MessageBubble` can be embedded separately.
- `relayTheme` and `monoTheme` provide the built-in palettes.

## Conversation

- `ChatStore` owns observable conversation state.
- `ChatSession` handles sending, streaming, cancellation, retry, regeneration, and edit-and-resend.
- `createConversation` and `createMessage` create schema-compatible records.

## Transports

- `ChatTransport` is the provider-neutral streaming contract.
- `CommandTransport` connects a JSON Lines subprocess.
- `EchoTransport` supplies deterministic local demonstrations and tests.

## Files

- `saveConversation` and `loadConversation` use versioned JSON.
- `exportConversation` writes a readable Markdown transcript.
- `enableAutosave` attaches debounced persistence to a store.
