import { existsSync } from 'fs';
import { dirname, join } from 'path';

export enum PackageManagerType {
  YARN,
  NPM,
  PNPM,
  BUN,
}

function findByLockFile(cwd: string): PackageManagerType | undefined {
  if (existsSync(join(cwd, 'yarn.lock'))) return PackageManagerType.YARN;
  if (existsSync(join(cwd, 'package-lock.json'))) return PackageManagerType.NPM;
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) return PackageManagerType.PNPM;
  if (existsSync(join(cwd, 'bun.lockb'))) return PackageManagerType.BUN;

  const parent = dirname(cwd);
  if (cwd !== parent) {
    return findByLockFile(parent);
  }
  return undefined;
}

export function detectPackageManager(cwd: string): PackageManagerType | undefined {
  return findByLockFile(cwd);
}

export function execCommandForPackagageManager(cwd: string) {
  const manager = detectPackageManager(cwd);
  switch (manager) {
    case PackageManagerType.YARN: return ['yarn'];
    case PackageManagerType.NPM: return ['npx'];
    case PackageManagerType.PNPM: return ['pnpm'];
    case PackageManagerType.BUN: return ['bun', 'run'];
  }

  return undefined;
}
