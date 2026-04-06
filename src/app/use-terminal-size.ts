import {useEffect, useState} from 'react';

export interface TerminalSize {
  columns: number;
  rows: number;
}

export const useTerminalSize = (): TerminalSize => {
  const read = (): TerminalSize => ({
    columns: process.stdout.columns ?? 80,
    rows: process.stdout.rows ?? 24,
  });
  const [size, setSize] = useState(read);
  useEffect(() => {
    const resize = (): void => setSize(read());
    process.stdout.on('resize', resize);
    return () => process.stdout.off('resize', resize);
  }, []);
  return size;
};
