import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fork, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

test('packed plugin in Openfox 2.0.161: provider context, settings, restart and lifecycle', { timeout: 120000 }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'openfox-ponytail-e2e-'));
  const requests = [];
  const provider = createServer(async (req, res) => {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ data: [{ id: 'ponytail-test-model', object: 'model' }] }));
      return;
    }
    let body = '';
    for await (const chunk of req) body += chunk;
    const request = JSON.parse(body);
    requests.push(request);
    res.setHeader('Content-Type', 'text/event-stream');
    res.end(`data: ${JSON.stringify({ id: 'test', object: 'chat.completion.chunk', choices: [{ index: 0, delta: { content: 'Verified.' }, finish_reason: null }] })}\n\ndata: ${JSON.stringify({ id: 'test', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }], usage: { prompt_tokens: 100, completion_tokens: 2, total_tokens: 102 } })}\n\ndata: [DONE]\n\n`);
  });
  let child;
  let output = '';
  let base;
  const api = async (path, method = 'GET', body) => {
    const response = await fetch(`${base}/api/${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }).catch(cause => { throw new Error(`${method} ${path}\n${output}`, { cause }); });
    const text = await response.text();
    assert.match(response.headers.get('content-type') ?? '', /application\/json/, `${method} ${path}: ${text.slice(0,300)}\n${output}`);
    const data = JSON.parse(text);
    assert.ok(response.ok, `${method} ${path}: ${JSON.stringify(data)}\n${output}`);
    return data;
  };
  const start = async () => {
    output = '';
    child = fork(new URL('./server.mjs', import.meta.url), [dir, `http://127.0.0.1:${provider.address().port}/v1`], { stdio: ['ignore', 'pipe', 'pipe', 'ipc'] });
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { output += data; });
    const port = await new Promise((resolve, reject) => {
      child.once('message', message => resolve(message.port));
      child.once('exit', code => reject(new Error(`Openfox exited ${code}: ${output}`)));
      child.once('error', reject);
    });
    base = `http://127.0.0.1:${port}`;
  };
  const stop = async () => {
    if (!child || child.exitCode !== null) return;
    child.send('stop');
    const [code] = await once(child, 'exit');
    assert.equal(code, 0, output);
    assert.doesNotMatch(output, /\b(?:WARN|ERROR)\b|Warning:|ExperimentalWarning/);
  };
  try {
    provider.listen(0, '127.0.0.1');
    await once(provider, 'listening');
    const root = fileURLToPath(new URL('../../', import.meta.url));
    const packOutput = execFileSync('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', dir], { cwd: root, encoding: 'utf8' });
    const tarball = join(dir, JSON.parse(packOutput)[0].filename);
    const installedDir = join(dir, 'e2e/.openfox-test/plugins/openfox-ponytail');
    await mkdir(installedDir, { recursive: true });
    execFileSync('tar', ['-xzf', tarball, '--strip-components=1', '-C', installedDir]);
    await start();
    const pluginPath = 'plugins/openfox-ponytail';
    const list = async () => (await api('plugins/list')).plugins.find(p => p.id === 'openfox-ponytail' || p.name === 'openfox-ponytail');
    const active = await list();
    assert.ok(active, JSON.stringify(await api('plugins/list')));
    assert.equal(active.enabled, true);
    assert.equal(active.contributions.commands, 6);
    assert.equal(active.contributions.skillSources, 1);
    const commands = await api('commands');
    assert.equal(commands.userItems.filter(c => c.pluginId === 'openfox-ponytail').length, 6);
    const skills = (await api('skills')).items.filter(s => s.source === 'plugin' && s.id.startsWith('ponytail'));
    assert.equal(skills.length, 6);
    for (const command of commands.userItems.filter(c => c.pluginId === 'openfox-ponytail')) {
      const detail = await api(`commands/${command.id}`);
      assert.ok(JSON.stringify(detail).includes('prompt'));
    }
    const projects = [];
    for (const name of ['a', 'b']) {
      const workdir = join(dir, name);
      await mkdir(workdir);
      const { project } = await api('projects', 'POST', { name, workdir });
      await api(`projects/${project.id}`, 'PUT', { customInstructions: 'PRESERVE_EXISTING_PROJECT_INSTRUCTION' });
      const { session } = await api('sessions', 'POST', { projectId: project.id });
      projects.push({ project, session });
    }
    const setLevel = async (index, level) => api(`${pluginPath}/settings`, 'PUT', { scope: 'project', projectId: projects[index].project.id, values: { level } });
    const turn = async (index, level) => {
      const before = requests.length;
      const id = projects[index].session.id;
      await api(`sessions/${id}/message`, 'POST', { content: 'Reply Verified without using tools.' });
      let completed = false;
      for (let attempt = 0; attempt < 200; attempt++) {
        await delay(50);
        const state = await api(`sessions/${id}`);
        if (requests.length > before && state.session.isRunning === false) { completed = true; break; }
      }
      assert.ok(completed, `Turn did not complete\n${output}`);
      assert.ok(requests.length > before, `No provider request\n${output}`);
      const prompt = requests.at(-1).messages.filter(m => m.role === 'system' || m.role === 'developer').map(m => m.content).join('\n');
      assert.match(prompt, /PRESERVE_EXISTING_PROJECT_INSTRUCTION/);
      const matches = prompt.match(/PONYTAIL MODE ACTIVE/g) ?? [];
      assert.equal(matches.length, level === 'off' ? 0 : 1, `${output}\nProvider prompt tail: ${prompt.slice(-1500)}`);
      if (level !== 'off') assert.ok(prompt.includes(`level: ${level}`));
    };
    await turn(0, 'full');
    await setLevel(0, 'lite');
    await turn(0, 'lite');
    await turn(1, 'full');
    await setLevel(0, 'ultra');
    await turn(0, 'ultra');
    await setLevel(0, 'off');
    await turn(0, 'off');
    assert.equal((await list()).contributions.commands, 6);
    await setLevel(0, 'ultra');
    await stop();
    await start();
    assert.equal((await api(`${pluginPath}/settings?scope=project&projectId=${projects[0].project.id}`)).values.level, 'ultra');
    await turn(0, 'ultra');
    await api(`${pluginPath}/disable`, 'POST', {});
    assert.equal((await list()).enabled, false);
    assert.equal((await fetch(`${base}/api/${pluginPath}/settings`)).status, 404);
    assert.equal((await api('commands')).userItems.filter(c => c.pluginId === 'openfox-ponytail').length, 0);
    assert.equal((await api('skills')).items.filter(s => s.source === 'plugin' && s.id.startsWith('ponytail')).length, 0);
    await turn(0, 'off');
    await api(`${pluginPath}/enable`, 'POST', {});
    assert.equal((await list()).contributions.commands, 6);
    await turn(0, 'ultra');
    await stop();
  } finally {
    if (child && child.exitCode === null) { child.kill(); await once(child, 'exit'); }
    await new Promise(resolve => provider.close(resolve));
    await rm(dir, { recursive: true, force: true });
  }
});
