import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { filterSkillBodyForMode } from '../dist/levels.js';

const upstream = createRequire(import.meta.url)('../vendor/ponytail/hooks/ponytail-instructions.js');
test('level selection matches the vendored upstream implementation', () => {
  const body = readFileSync(new URL('../vendor/ponytail/skills/ponytail/SKILL.md', import.meta.url), 'utf8');
  const examples = '\n- lite: "small"\n- full: "complete"\n- ultra: "question"\n- Full: ordinary rule\n| **Safety** | keep |';
  for (const level of ['lite', 'full', 'ultra', ' LITE ', 'unknown']) {
    assert.equal(filterSkillBodyForMode(body + examples, level), upstream.filterSkillBodyForMode(body + examples, level));
  }
});
