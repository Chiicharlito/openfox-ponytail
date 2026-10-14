// Adapted from Ponytail 5.1.0 hooks/ponytail-instructions.js (MIT; see ATTRIBUTION.md).
function normalizeMode(mode: string): string | undefined {
  const normalized = mode.trim().toLowerCase();
  return ['off', 'lite', 'full', 'ultra'].includes(normalized) ? normalized : undefined;
}

export function filterSkillBodyForMode(body: string, mode: string): string {
  const effectiveMode = normalizeMode(mode) || 'full';
  return body.replace(/^---[\s\S]*?---\s*/, '').split(/\r?\n/).filter(line => {
    const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
    if (tableLabel) {
      const labelMode = normalizeMode(tableLabel[1]!.trim());
      if (labelMode) return labelMode === effectiveMode;
    }
    const exampleLabel = line.match(/^-\s*([^:]+):\s*"/);
    if (exampleLabel) {
      const labelMode = normalizeMode(exampleLabel[1]!.trim());
      if (labelMode) return labelMode === effectiveMode;
    }
    return true;
  }).join('\n');
}
