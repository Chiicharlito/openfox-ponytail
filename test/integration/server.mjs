import '../strict-console.mjs';
import { join } from 'node:path';
import { createServerHandle } from 'openfox';

const [directory, providerUrl] = process.argv.slice(2);
process.chdir(directory);
const model = 'ponytail-test-model';
const provider = { id: 'test', name: 'Local test provider', url: providerUrl, backend: 'openai', apiKey: 'local-test', models: [{ id: model, contextWindow: 200000, source: 'user' }], isActive: true, createdAt: new Date().toISOString() };
const handle = await createServerHandle({
  mode: 'test',
  workdir: directory,
  globalConfigPath: join(directory, 'config.json'),
  database: { path: join(directory, 'openfox.db') },
  logging: { level: 'warn' },
  server: { port: 0, host: '127.0.0.1', openBrowser: false },
  llm: { baseUrl: providerUrl, model, backend: 'openai', timeout: 10000, idleTimeout: 10000 },
  context: { maxTokens: 200000, compactionThreshold: 0.8, compactionTarget: 0.5 },
  agent: { maxIterations: 2, maxConsecutiveFailures: 1, toolTimeout: 10000 },
  providers: [provider],
  defaultModelSelection: `test/${model}`,
  activeProviderId: 'test',
  defaultAgent: 'builder',
  disableAutoSessionTitle: true,
  mcpServers: {},
});
const { port } = await handle.start(0);
process.send({ port });
process.on('message', async () => {
  await handle.close();
  process.exit(process.exitCode ?? 0);
});
