# Architecture

Relay Chat keeps model integration outside the interface.

1. `ChatStore` owns a versioned conversation snapshot and notifies subscribers.
2. `ChatSession` creates turns and consumes `ChatTransport` chunks.
3. Transports connect either in-process model code or an external JSON Lines command.
4. The Ink application renders store state and forwards user actions to the session.
5. Persistence utilities save the same conversation record without depending on the interface.

This separation lets an application replace the model adapter, persistence policy, or individual interface components without copying the rest of the client.

Agent runs and tools are deferred. A later package can introduce those event types without weakening the chat transport or presenting unfinished approval controls here.
