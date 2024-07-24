import { runExit } from 'clipanion';

import { BuildCommand } from './commands/build';
import { DeployCommand } from './commands/deploy';
import { InitCommand } from './commands/init';
import { SpecDeployCommand } from './commands/spec-deploy';
import { UploadCommand } from './commands/upload';

runExit([
  BuildCommand,
  DeployCommand,
  UploadCommand,
  SpecDeployCommand,
  InitCommand,
], {});
