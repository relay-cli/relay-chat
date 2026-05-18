import readline from 'node:readline';

const input = readline.createInterface({input: process.stdin, crlfDelay: Infinity});
for await (const line of input) {
  const request = JSON.parse(line);
  const prompt = request.messages.findLast((message) => message.role === 'user')?.content ?? '';
  const reply = `The command adapter received: ${prompt}\n\nThis response arrived through JSON Lines.`;
  for (const word of reply.match(/\S+\s*|\n/g) ?? []) {
    process.stdout.write(`${JSON.stringify({type: 'delta', text: word})}\n`);
    await new Promise((resolve) => setTimeout(resolve, 18));
  }
  process.stdout.write(`${JSON.stringify({type: 'model', model: 'example-command'})}\n`);
  process.stdout.write(`${JSON.stringify({type: 'done'})}\n`);
}
