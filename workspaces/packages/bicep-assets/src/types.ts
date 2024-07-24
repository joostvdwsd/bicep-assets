import * as t from 'typanion';

export const isManifest = t.isObject({
  resourceProviderId: t.isString(),
  assets: t.isRecord(t.isString()),
});

export type Manifest = t.InferType<typeof isManifest>;
