import { connectionString, Asset } from 'utils.bicep'

/////////////////////////////
// Params

@description('The asset to get a download url')
param asset Asset

param expirationSeconds int = 3600

//////////////////////////////////////////////////
// Calculated variables

var assetFeed = uniqueString(resourceGroup().id, string(expirationSeconds), string(asset))

#disable-next-line BCP081
resource deployAsset 'Microsoft.CustomProviders/associations@2018-09-01-preview' = {
  name: 'asset-deployment-${assetFeed}'
  properties: {
    targetResourceId: asset.resourceProviderId

    #disable-next-line BCP037
    action: 'sas-url'
    #disable-next-line BCP037
    asset_filename: asset.filename
    #disable-next-line BCP037
    expirationSeconds: expirationSeconds
  }
}

#disable-next-line BCP053
output downloadSasUrl string = deployAsset.properties.downloadSasUrl
