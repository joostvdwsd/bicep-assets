import { DefaultAzureCredential } from '@azure/identity';
import axios from 'axios';
import { Command, Option } from 'clipanion';
import { mkdtemp, readFile, rm } from 'fs/promises';
import { existsSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import * as t from 'typanion';
import { archiveFolder } from 'zip-lib';

import { isManifest } from '../utils/manifest';

export class DeployCommand extends Command {
  static paths = [
    ['deploy'],
  ];

  distFolder = Option.String('--dist-folder', '.bicep-assets');

  executeBuild = Option.Boolean('--build', true);

  async execute() {
    if (this.executeBuild) {
      await this.cli.run(['build']);
    }

    const manifestFile = join(this.distFolder, 'manifest.json');

    if (!existsSync(manifestFile)) {
      throw new Error(`No asset file found in dit folder: '${this.distFolder}'`);
    }

    const manifestContent = JSON.parse(await readFile(manifestFile, 'utf-8'));

    t.assert(manifestContent, isManifest);

    const files = Object.values(manifestContent.assets).map(fileName => {
      const stat = statSync(join(this.distFolder, fileName));
      return stat.isDirectory() ? `${fileName}.zip` : fileName;
    });

    const uploads = await this.getUploads(files, manifestContent.resourceProviderId);

    console.log(uploads);

    for (const [name, fileName] of Object.entries(manifestContent.assets)) {
      const stat = statSync(join(this.distFolder, fileName));
      const targetFileName = stat.isDirectory() ? `${fileName}.zip` : fileName;

      if (uploads[targetFileName]) {
        await this.uploadAsset(name, fileName, uploads[targetFileName], targetFileName, stat.isDirectory());
      }
    }
  }

  async getUploads(assetFiles: string[], resourceProviderId: string): Promise<Record<string, string>> {
    const creds = new DefaultAzureCredential();
    const token = await creds.getToken(['https://management.azure.com/.default']);

    const res = await axios.post(`https://management.azure.com${resourceProviderId}/uploadAssetsSas`, {
      properties: {
        assets: assetFiles,
      },
    }, {
      params: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'api-version': '2018-09-01-preview',
      },
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    });

    return res.data.assets;
  }

  async uploadAsset(name: string, fileName: string, sasUrl: string, targetFileName: string, compress: boolean) {
    const tempFolder = await mkdtemp(tmpdir());
    try {
      console.log(`Publishing asset: ${fileName} (${name})`);
      if (compress) {
        await archiveFolder(join(this.distFolder, fileName), join(tempFolder, targetFileName));

        const zipFile = await readFile(join(tempFolder, targetFileName));
        await axios.put(sasUrl, zipFile, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-ms-blob-type': 'BlockBlob',
          },
        });
      } else {
        const content = await readFile(join(this.distFolder, fileName));
        await axios.put(sasUrl, content, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-ms-blob-type': 'BlockBlob',
          },
        });
      }
    } finally {
      await rm(tempFolder, {
        recursive: true,
      });
    }
  }
}
