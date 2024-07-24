@export()
type Asset = {
  resourceProviderId: string
  filename: string
}


@export()
type SasKeySet = {
  keyName: string
  value: string
}

@export()
type ListKeySet = {
  keys: SasKeySet[]
}

@export()
func connectionString(name string, keySet ListKeySet) string => 'DefaultEndpointsProtocol=https;AccountName=${name};EndpointSuffix=${environment().suffixes.storage};AccountKey=${keySet.keys[0].value}'


@export()
type Environment = 'dev' | 'tst' | 'acc' | 'prd'
