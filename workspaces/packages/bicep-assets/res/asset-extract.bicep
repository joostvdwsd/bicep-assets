import { connectionString, Asset } from 'utils.bicep'

//////////////////////////////
// Types

type Target = {
  storageAccount: string
  container: string
}

/////////////////////////////
// Params

@description('The source asset to deploy')
param asset Asset

@description('The target blob/container')
param target Target

//////////////////////////////////////////////////
// Calculated variables

var assetFeed = uniqueString(resourceGroup().id, string(target), string(asset), '12')

param baseTime string = utcNow('u')

resource targetAccount 'Microsoft.Storage/storageAccounts@2023-05-01' existing = {
  name: target.storageAccount
}

var uploadSAS = listAccountSAS(targetAccount.id, '2021-04-01', {
  signedProtocol: 'https'
  signedResourceTypes: 'sco'
  signedPermission: 'rwl'
  signedServices: 'b'
  signedExpiry: dateTimeAdd(baseTime, 'PT1H')
}).accountSasToken


#disable-next-line BCP081
resource deployAsset 'Microsoft.CustomProviders/associations@2018-09-01-preview' = {
  name: 'asset-deployment-${assetFeed}'
  properties: {
    targetResourceId: asset.resourceProviderId

    #disable-next-line BCP037
    action: 'extract'
    #disable-next-line BCP037
    asset_filename: asset.filename
    #disable-next-line BCP037
    target_account_name: target.storageAccount
    #disable-next-line BCP037
    target_account_sas: uploadSAS
    #disable-next-line BCP037
    target_account_container: target.container
  }
}
