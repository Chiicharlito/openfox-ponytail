import { readFileSync } from 'node:fs';
import type { PluginRegistry } from 'openfox/plugin';
import { filterSkillBodyForMode } from './levels.js';

const levels = ['lite', 'full', 'ultra', 'off'] as const;
const ids = ['ponytail', 'ponytail-review', 'ponytail-audit', 'ponytail-debt', 'ponytail-gain', 'ponytail-help'] as const;

function resource(id: string): string {
  try {
    return readFileSync(new URL(`../resources/${id}.md`, import.meta.url), 'utf8');
  } catch (cause) {
    throw new Error(`Missing or unreadable Ponytail resource: ${id}.md`, { cause });
  }
}

export function register(registry: PluginRegistry): void {
  // Load everything before registration so an incomplete package cannot activate partially.
  const rules = resource('ponytail');
  const help = resource('ponytail-help');
  const skills = ids.map(id => ({
    id,
    name: id,
    description: id === 'ponytail' ? 'Ponytail usage and native project level settings.' : `One-shot ${id} report; changes nothing.`,
    prompt: id === 'ponytail' || id === 'ponytail-help' ? help : resource(id),
    group: 'Ponytail',
  }));
  const blocks = new Map(levels.filter(level => level !== 'off').map(level => [level,
    `\n\n<!-- openfox-ponytail:5.1.0 -->\nPONYTAIL MODE ACTIVE — level: ${level}\n\n${filterSkillBodyForMode(rules, level)}\n<!-- /openfox-ponytail -->`,
  ]));
  const pluginContext = registry.context;

  registry.registerSettings({ fields: [{
    key: 'level',
    type: 'select',
    label: { en: 'Ponytail level', fr: 'Niveau Ponytail' },
    description: { en: 'Saved per project. Applies on the next model call.', fr: 'Conservé par projet. Appliqué au prochain appel au modèle.' },
    scope: 'project',
    default: 'full',
    options: levels.map(value => ({ value, label: { en: value, fr: value } })),
  }] });
  for (const { id, name, prompt } of skills) registry.registerCommand({ id, name, prompt });
  registry.registerSkillSource({ id: 'ponytail', label: { en: 'Ponytail', fr: 'Ponytail' }, load: () => skills });
  registry.registerMessageTransform({
    id: 'ponytail',
    transform(messages, context) {
      const level = context.projectId ? pluginContext.settings('project', context.projectId).level ?? 'full' : 'full';
      if (!levels.some(candidate => candidate === level)) throw new Error(`Invalid Ponytail level: ${String(level)}`);
      let systemPrompt = context.systemPrompt;
      // Remove only our exact generated blocks, preserving every other instruction and whitespace.
      for (const block of blocks.values()) systemPrompt = systemPrompt.replaceAll(block, '');
      if (level !== 'off') systemPrompt += blocks.get(level as 'lite' | 'full' | 'ultra');
      return { messages, systemPrompt };
    },
  });
}
