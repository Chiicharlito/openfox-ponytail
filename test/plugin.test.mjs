import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import * as plugin from '../dist/index.js';

function setup(values = {}) {
  const calls = { commands: [], sources: [], transforms: [], settingsReads: [] };
  let registering = true;
  plugin.register({
    get context() {
      assert.ok(registering, 'Openfox exposes registry.context only during registration');
      return { settings: (scope, id) => { calls.settingsReads.push([scope, id]); return values[id] ?? {}; } };
    },
    registerSettings: (schema) => { calls.schema = schema; },
    registerCommand: (command) => calls.commands.push(command),
    registerSkillSource: (source) => calls.sources.push(source),
    registerMessageTransform: (transform) => calls.transforms.push(transform),
  });
  registering = false;
  calls.apply = (systemPrompt = 'Existing instructions.\n', projectId = 'a') =>
    calls.transforms[0].transform([], { systemPrompt, projectId, workdir: '/project', sessionId: 's', model: 'test' });
  return calls;
}

test('registers six commands, six skills and native project settings', async () => {
  const calls = setup();
  const ids = ['ponytail', 'ponytail-review', 'ponytail-audit', 'ponytail-debt', 'ponytail-gain', 'ponytail-help'];
  assert.deepEqual(calls.commands.map(c => c.id), ids);
  assert.deepEqual((await calls.sources[0].load()).map(s => s.id), ids);
  const field = calls.schema.fields[0];
  assert.equal(field.scope, 'project');
  assert.equal(field.default, 'full');
  assert.deepEqual(field.options.map(o => o.value), ['lite', 'full', 'ultra', 'off']);
  assert.equal(calls.commands[0].prompt, calls.commands[5].prompt);
  for (const item of [...calls.commands, ...await calls.sources[0].load()]) {
    assert.doesNotMatch(item.prompt, /PONYTAIL_DEFAULT_MODE|write flag files|Active for the whole session/);
  }
  assert.match(calls.commands[4].prompt, /never measured savings in Openfox/);
});

test('defaults to full and preserves messages and existing instructions exactly', () => {
  const calls = setup();
  const messages = [{ role: 'user', content: 'hello' }];
  const context = Object.freeze({ systemPrompt: 'Keep me.\n\n', sessionId: 's', workdir: '/', model: 'test' });
  const result = calls.transforms[0].transform(messages, context);
  assert.equal(result.messages, messages);
  assert.ok(result.systemPrompt.startsWith(context.systemPrompt));
  assert.match(result.systemPrompt, /level: full/);
  assert.deepEqual(calls.settingsReads, []);
});

for (const level of ['lite', 'full', 'ultra']) {
  test(`injects only the ${level} level`, () => {
    const result = setup({ a: { level } }).apply();
    assert.match(result.systemPrompt, new RegExp(`level: ${level}`));
    for (const candidate of ['lite', 'full', 'ultra']) {
      assert.equal(result.systemPrompt.includes(`| **${candidate}** |`), candidate === level);
    }
    assert.match(result.systemPrompt, /Never cut: validation/);
  });
}

test('hot changes and project isolation do not duplicate or retain stale instructions', () => {
  const values = { a: { level: 'lite' }, b: { level: 'ultra' } };
  const calls = setup(values);
  const base = 'Keep exact trailing whitespace.  \n';
  const first = calls.apply(base).systemPrompt;
  assert.equal(calls.apply(first).systemPrompt, first);
  values.a.level = 'full';
  const updated = calls.apply(first).systemPrompt;
  assert.match(updated, /level: full/);
  assert.doesNotMatch(updated, /level: lite/);
  assert.match(calls.apply(base, 'b').systemPrompt, /level: ultra/);
  values.a.level = 'off';
  assert.equal(calls.apply(updated).systemPrompt, base);
  assert.equal(calls.apply(base).systemPrompt, base);
  assert.equal(calls.commands.length, 6);
  assert.match(setup(values).apply(base, 'b').systemPrompt, /level: ultra/);
});

test('rejects corrupted setting explicitly', () => {
  assert.throws(() => setup({ a: { level: 'invalid' } }).apply(), /Invalid Ponytail level/);
});

test('missing bundled resource fails registration before any contributions', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ponytail-missing-'));
  try {
    await cp(new URL('../dist/', import.meta.url), join(dir, 'dist'), { recursive: true });
    await cp(new URL('../resources/', import.meta.url), join(dir, 'resources'), { recursive: true });
    await cp(new URL('../package.json', import.meta.url), join(dir, 'package.json'));
    await rm(join(dir, 'resources/ponytail-review.md'));
    const broken = await import(pathToFileURL(join(dir, 'dist/index.js')));
    assert.throws(() => broken.register({}), /Missing or unreadable Ponytail resource.*ponytail-review/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
