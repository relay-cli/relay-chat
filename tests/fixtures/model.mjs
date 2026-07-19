import readline from 'node:readline';

const input = readline.createInterface({input: process.stdin, crlfDelay: Infinity});
for await (const line of input) {
  const request = JSON.parse(line);
  process.stdout.write(`${JSON.stringify({type: 'delta', text: `seen ${request.messages.length}`})}\n`);
  process.stdout.write(`${JSON.stringify({type: 'usage', usage: {outputTokens: 2}})}\n`);
  process.stdout.write(`${JSON.stringify({type: 'done'})}\n`);
}
