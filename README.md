# bicep-assets

Bicep assets is a tool to add a simple, code completed way of working with local files during your bicep deployment

![NPM Version](https://img.shields.io/npm/v/bicep-assets)

# How would you use this

Assume a generated static website

## Configure the asset build

```yaml (bicep-assets-config.yaml)
assets:
  - api.yaml
  - name: static_frontend
    path: ./frontend
    plugin: vite
```

## Deploy/Upload the generated assets

```sh
$ bicep-assets deploy
```

## Use the asset and decide in bicep what to do with it

```bicep
import { assets } from './bicep-assets.bicep'

resource staticStiteStorageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'staticStiteStorageAccount'
  kind: 'StorageV2'
}

module assetExtract 'ts/shared:bicep-assets-extract:1.0.0' = {
  name: 'Deploy static website'
  params: {
    asset: assets.static_frontend
    target: {
      storageAccount: staticStiteStorageAccount.name
      container: '$web'
    }
  }
}
```

# Installation

Install the cli package.

```sh
$ npm install -g bicep-assets
```

Setup the current folder to use the asset provider. This will deploy the custom resource provider.

```sh
$ bicep-assets init
```

Deploy the template specs so you can use them in bicep

```sh
$ bicep-assets spec deploy -g my-resource-group
```

# Available modules

## Copy asset

This copies the asset from the asset storage account to the target storage account blob storage.
> Example use: copy the generated zip to a storage account to be used by a zipdeploy

```bicep
module assetCopy 'ts/shared:bicep-assets-copy:0.0.0' = {
  name: 'test-bicep-assets-asset-copy'
  params: {
    asset: assets.bicep_assets_config_yaml
    target: {
      storageAccount: targetStorage.name
      container: 'target-container'
    }
  }
}
```

### Properties
| Name | Type | Required | Description |
| :- | :- | :-: | :- |
| asset | Asset | yes | The asset to deploy |
| target.storageAccount | string | yes | The name of the target storage account | 
| target.container | string | yes | The name of the target container |
| target.fileName | string | no | The targetfile name, if not provided it uses the default hash-based filename of the asset |

## Extract asset

This extract a zip/folder based asset and puts the files in the target storage account blob storage
> Example use: extract a static website to a storage account blob

```bicep
module assetExtract 'ts/shared:bicep-assets-extract:0.0.0' = {
  name: 'test-bicep-assets-asset-extract'
  params: {
    asset: assets.bicep_assets_config_yaml
    target: {
      storageAccount: targetStorage.name
      container: 'target-container'
    }
  }
}
```

### Properties
| Name | Type | Required | Description |
| :- | :-: | :-: | :- |
| asset | Asset | yes | The asset to deploy |
| target.storageAccount | string | yes | The name of the target storage account | 
| target.container | string | yes | The name of the target container |

## Generate SAS url

This generates a download SAS url to the specified asset
> Example use: Pass a local file to a custom resource

```bicep
module assetSas 'ts/shared:bicep-assets-sas-url:0.0.0' = {
  name: 'test-bicep-assets-asset-sas-url'
  params: {
    asset: assets.api_yaml
  }
}

module useAsset './my-module' = {
  name: 'MyModule'
  params: {
    api_yaml_location: assetSas.outputs.downloadSasUrl
  }
}
```

### Properties
| Name | Type | Required | Description |
| :- | :-: | :-: | :- |
| asset | Asset | yes | The asset to deploy |

### Outputs
| Name | Type | Description |
| :- | :-: | :- |
| downloadSasUrl | Asset | The asset to deploy |

# How does it work

![](./docs/designs/bicep-assets-upload.drawio.svg)
