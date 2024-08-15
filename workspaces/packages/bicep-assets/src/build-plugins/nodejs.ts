import * as esbuild from 'esbuild';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import * as t from 'typanion';

import { AssetDefinition } from '../configuration';
import { IBuildCommand, IBuildPlugin } from '../utils/plugin-manager';

export const isNodeConfiguration = t.isArray(t.isString());
export type NodeConfiguration = t.InferType<typeof isNodeConfiguration>;

export class NodeBuildCommand implements IBuildCommand {
  constructor(public name: string, private entryPoint: string, public plugin: IBuildPlugin) {}

  async buildInFolder(folder: string) {
    await esbuild.build({
      entryPoints: [
        this.entryPoint,
      ],
      bundle: true,
      platform: 'node',
      metafile: true,
      logLevel: 'info',
      // minify: true,
      external: [
        '@azure/functions-core',
      ],
      outfile: join(folder, 'index.js'),
    });

    await writeFile(join(folder, 'package.json'), JSON.stringify({
      main: 'index.js',
    }));
  }
}


export class NodeJsBuildPlugin implements IBuildPlugin {
  async generateBuildCommands(configuration: AssetDefinition): Promise<IBuildCommand[]> {
    return [
      new NodeBuildCommand(configuration.name, configuration.path, this),
    ];
  }
}
