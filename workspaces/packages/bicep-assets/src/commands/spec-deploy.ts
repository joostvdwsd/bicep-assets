import { Command, Option } from 'clipanion';
import { sync } from 'cross-spawn';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export class SpecDeployCommand extends Command {
  static paths = [
    ['spec', 'deploy'],
  ];

  resourceGroup = Option.String('-g,--resource-group', {
    required: true,
  });
  prefix = Option.String('-p,--prefix', 'bicep-assets');

  version: string;
  constructor() {
    super();
    const json = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'));
    this.version = json.version;
  }

  async execute() {
    this.deploySpec(resolve(__dirname, '../../res/asset-copy.bicep'), 'copy');
    this.deploySpec(resolve(__dirname, '../../res/asset-extract.bicep'), 'extract');
    this.deploySpec(resolve(__dirname, '../../res/asset-sas-url.bicep'), 'sas-url');
    this.deploySpec(resolve(__dirname, '../../res/asset-types.bicep'), 'types');
  }

  deploySpec(bicep: string, name: string) {
    console.log(`Deploying '${this.prefix}-${name}' to '${this.resourceGroup}'`);
    sync('az', [
      'ts',
      'create',
      '--name', `${this.prefix}-${name}`,
      '--version', this.version,
      '--resource-group', this.resourceGroup,
      '--template-file', bicep,
    ]);
  }
}
