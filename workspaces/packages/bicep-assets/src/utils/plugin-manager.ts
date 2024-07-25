import { AssetDefinition } from '../configuration';

export interface IBuildCommand {
  name: string;
  plugin: IBuildPlugin;
  buildInFolder(folder: string): Promise<void | string>;
}

export interface PluginConfig {

}

export interface IBuildPlugin {
  generateBuildCommands(config: unknown): Promise<IBuildCommand[]>;
}

export class PluginManager {
  plugins: Map<string, IBuildPlugin> = new Map();

  register(name: string, plugin: IBuildPlugin) {
    this.plugins.set(name, plugin);
  }

  async load(assetDefinitions: AssetDefinition[]) {
    const commands: IBuildCommand[] = [];

    for (const assetDefinition of assetDefinitions) {
      const plugin = this.plugins.get(assetDefinition.plugin);
      if (plugin) {
        commands.push(...await plugin.generateBuildCommands(assetDefinition));
      }
    }

    return commands;
  }
}
