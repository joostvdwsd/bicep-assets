import { assets } from 'bicep-assets.bicep'
import { Asset } from 'ts/shared:bicep-assets-types:0.0.0'

resource assetStorage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'testba${uniqueString(resourceGroup().id)}'
  location: resourceGroup().location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Cool'
    supportsHttpsTrafficOnly: true
    defaultToOAuthAuthentication: true    
  }
}

module assetExtract 'ts/shared:bicep-assets-extract:0.0.0' = {
  name: 'test-bicep-assets-asset-extract'
  params: {
    asset: assets.test_folder
    target: {
      storageAccount: assetStorage.name
      container: 'test-bicep-assets'
    }
  }
}

module assetCopy 'ts/shared:bicep-assets-copy:0.0.0' = {
  name: 'test-bicep-assets-asset-copy'
  params: {
    asset: assets.bicep_assets_config_yaml
    target: {
      storageAccount: assetStorage.name
      container: 'test-bicep-assets'
    }
  }
}

module assetSas 'ts/shared:bicep-assets-sas-url:0.0.0' = {
  name: 'test-bicep-assets-asset-sas-url'
  params: {
    asset: assets.bicep_assets_config_yaml
  }
}

output downloadSasUrl string = assetSas.outputs.downloadSasUrl
