import {spawnSync, type ChildProcess} from 'node:child_process';

export const terminateCommand = (child: ChildProcess): boolean => {
  if (child.pid === undefined || child.exitCode !== null || child.signalCode !== null) return false;
  if (process.platform === 'win32') {
    const result = spawnSync('taskkill.exe', ['/pid', String(child.pid), '/t', '/f'], {
      windowsHide: true,
      stdio: 'ignore',
    });
    return result.status === 0 || child.kill('SIGTERM');
  }
  return child.kill('SIGTERM');
};
