import * as spawn from 'cross-spawn';
import { resolve } from 'path';
import * as t from 'typanion';

import { AssetDefinition } from '../configuration';
import { execCommandForPackagageManager } from '../utils/detect-package-manager';
import { IBuildCommand, IBuildPlugin } from '../utils/plugin-manager';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isViteConfiguration = t.isOptional(t.isArray(t.isString()));
export type ViteConfiguration = t.InferType<typeof isViteConfiguration>;

export class ViteBuildCommand implements IBuildCommand {
  constructor(public name: string, private viteFolder: string, public plugin: IBuildPlugin) {}

  async buildInFolder(folder: string) {
    const execCommand = execCommandForPackagageManager(resolve(this.viteFolder));
    if (!execCommand) {
      throw new Error('Can\'t determine package manager');
    }
    const [command, ...args] = [...execCommand, 'vite', 'build', '--outDir', folder, '--emptyOutDir'];

    spawn.sync(command, args, {
      cwd: this.viteFolder,
      stdio: 'inherit',
      env: {
        ...process.env,
        CI: 'true',
      },
    });
  }
}


export class ViteBuildPlugin implements IBuildPlugin {
  async generateBuildCommands(configuration: AssetDefinition): Promise<IBuildCommand[]> {
    return [
      new ViteBuildCommand(configuration.name, configuration.path, this),
    ];
  }
}
