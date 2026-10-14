for (const method of ['warn', 'error']) {
  const original = console[method];
  console[method] = (...args) => {
    original(...args);
    process.exitCode = 1;
  };
}
process.on('warning', () => { process.exitCode = 1; });
