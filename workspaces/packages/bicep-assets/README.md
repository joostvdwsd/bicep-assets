# bicep-assets

Bicep assets is a tool to add a simple, code completed way of working with local files during your bicep deployment

![NPM Version](https://img.shields.io/npm/v/bicep-assets)

# Topics
- [How would you use this](#how-would-you-use-this)
- [Installation](#installation)
- [Available bicep/ARM Modules](#available-biceparm-modules)
- [Build phase](#build-phase)
  - [Generation of biceps-assets.bicep](#generation-of-bicep-assetsbicep)
  - [Build plugins](#build-plugins)
- [Explanation why this was created](#explanation-why-this-was-created)


# How would you use this

## Configure the asset build

> bicep-assets-config.yaml
```yaml
assets:
  - api.yaml
  - name: static_frontend
    path: ./frontend
    plugin: vite
```

## Use the asset and decide in bicep what to do with it

> main.bicep
```bicep
import { assets } from './bicep-assets.bicep'

// Create a simple storage account to host a static site
resource staticStiteStorageAccount 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'staticStiteStorageAccount'
  kind: 'StorageV2'
}

// Extract the website asset to the static site storage account using the custom resource provider
module assetExtract 'ts/shared:bicep-assets-extract:1.0.0' = {
  name: 'Deploy static website'
  params: {
    // Here we use the static frontend asset entry from the generated bicep file 'bicep-assets.bicep'
    asset: assets.static_frontend
    target: {
      storageAccount: staticStiteStorageAccount.name
      container: '$web'
    }
  }
}
```

## Deploy/Upload the generated assets and run your bicep deployment

```sh
$ bicep-assets deploy
$ az stack group create --name static-site-stack -g static-site-rg -f main.bicep
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

# Available bicep/arm modules

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

# Build phase

## Generation of bicep-assets.bicep

Bicep assets has a build phase before deployment. In this phase the *bicep-assets.bicep* file is generated. This file is used to import assets in your own bicep file.

## Build plugins

By default bicep assets can be used to copy files and folders into the azure space. However, there is also the option for build plugins to generate the content of the asset before deployment.

| Plugin | Description |
| :- | :- |
| vite | Build a static frontend using vite. This will call the vite command in the specified path and use the output param to redirect teh output in the asset storage |
| nodejs | This will bundle a nodejs application as a full functioning function app (v4) |
| << t.b.d. >> | Plugins will be added. Currently its node oriented but this is not the target state. There will follow plugins to generate a good python or powershell function (and others) | 

# Explanation why this was created

Originally we worked primarily with AWS in my company using CDK. A full integrated way of working was possible due to the asset management in CDK. We could execute build commands and use the output directly in the deployment.

When we moved more towards azure I thought bicep was a decent tool and maybe for our less technical end users better then AWS CDK.

However, using bicep I quickly discovered a very frustrating flow:
1. create a function app (v4) in bicep including storage accounts
2. upload the function source to the storage account created in step 1
3. create a zipdeploy package to deploy the function

Even in a simple variant we had 2 deployments separated by an upload. When the application grows this becomes even more troublesome.

With this cli application everything can be orchestrated in 1 bicep deployment which adds
- reproducibility
- consistency
- ease of use
- standardizing way of workings

# How does it work

![](./docs/designs/bicep-assets-upload.drawio.svg)
