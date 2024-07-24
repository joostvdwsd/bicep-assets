import { cp, stat } from 'fs/promises';
import { basename, join } from 'path';
import * as t from 'typanion';

import { AssetDefinition } from '../config';
import { IBuildCommand, IBuildPlugin } from '../plugin-manager';

const isViteConfiguration = t.isOptional(t.isArray(t.isString()));
export type ViteConfiguration = t.InferType<typeof isViteConfiguration>;

export class CopyBuildCommand implements IBuildCommand {
  constructor(public name: string, private path: string, public plugin: IBuildPlugin) {}

  async buildInFolder(folder: string): Promise<void | string> {
    const stats = await stat(this.path);

    if (stats.isDirectory()) {
      await cp(this.path, folder, {
        recursive: true,
      });
      return;
    } else if (stats.isFile()) {
      const target = join(folder, basename(this.path));
      await cp(this.path, target);

      // eslint-disable-next-line consistent-return
      return target;
    } else {
      throw new Error(`Invalid path: ${this.path}`);
    }
  }
}


export class CopyBuildPlugin implements IBuildPlugin {
  async generateBuildCommands(configuration: AssetDefinition): Promise<IBuildCommand[]> {
    return [
      new CopyBuildCommand(configuration.name, configuration.path, this),
    ];
  }
}
