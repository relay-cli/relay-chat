# Product contract

Relay Chat provides the conversation layer of a terminal AI client.

## Included

- editable multiline input and input history
- user, assistant, and system messages
- streamed assistant replies with cancellation
- retry, regenerate, and edit-and-resend flows
- markdown-aware terminal rendering
- conversation save, load, and export
- an in-process transport contract and a JSON Lines command bridge
- interactive and plain output modes

## Deferred

Tool execution, approval prompts, agent state, and multi-agent coordination are not part of this release. The message model can be extended later without presenting incomplete agent controls now.
