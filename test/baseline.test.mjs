import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pluginManifestSchema } from 'openfox/plugin';

test('manifest conforms to the public Openfox v2 contract', async () => {
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url)));
  assert.equal(pluginManifestSchema.parse(manifest).openfox.apiVersion, 2);
  assert.equal(manifest.dependencies, undefined);
});
