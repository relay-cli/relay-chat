import {defineConfig} from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.tsx'],
  format: ['esm'],
  target: 'node20',
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
});
