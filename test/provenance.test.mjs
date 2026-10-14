import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

test('vendored upstream files match their recorded SHA-256 hashes', () => {
  const root = new URL('../', import.meta.url);
  const manifest = readFileSync(new URL('vendor/SHA256SUMS', root), 'utf8');
  for (const line of manifest.trim().split('\n')) {
    const [expected, path] = line.split('  ');
    const actual = createHash('sha256').update(readFileSync(new URL(path, root))).digest('hex');
    assert.equal(actual, expected, path);
  }
});
