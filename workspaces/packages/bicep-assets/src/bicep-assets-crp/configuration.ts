import { InvocationContext } from '@azure/functions';
import { ActionHandler, Request } from 'azure-custom-resources';

export class ConfigurationAction implements ActionHandler {
  async execute(request: Request, context: InvocationContext) {
    return {
      properties: {
        version: process.env.BICEP_ASSETS_VERSION!,
      },
    };
  }
}
