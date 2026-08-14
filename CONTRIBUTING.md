# Contributing

Install Node.js 20 or newer, then run:

```sh
npm install
npm run check
```

Changes should include tests for observable behavior. Keep provider-specific SDKs outside the core package; integrations can implement `ChatTransport` or use the command protocol.

Agent execution and tool approval interfaces are outside the current product contract. Discuss changes to that boundary before implementing them.
