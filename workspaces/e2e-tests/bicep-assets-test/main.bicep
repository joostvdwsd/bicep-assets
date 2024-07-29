module assetsAccount './assets-sa.bicep' = {
  name: 'ne-assets'
  params: {
  }
}

output storageAccountName string = assetsAccount.outputs.storageAccountName
