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

```sh
$ npm install -g bicep-assets
```

# Setup

```sh
$ bicep-assets init
```

# How does it work

![](./docs/designs/bicep-assets-upload.drawio.svg)
