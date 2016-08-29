import path from 'path';
import cp from 'child_process';
import colors from 'colors/safe';
import watch from './lib/watch';

export default async (args) => {
  await require('./build')(Object.assign({ watch: true }, args));
  await require('./db-start')(args);
  await require('./db-prepare')(args);
  await require('./db-fixtures')(args);

  console.log(colors.yellow('Serve...')); // eslint-disable-line no-console

  if (args.help) {
    console.log('  Start the server.');
    return;
  }

  function start() {
    const server = cp.fork(path.join(__dirname, '../dist/server.js'), ['startServer'], {
      env: Object.assign({ NODE_ENV: 'development' }, process.env),
      silent: false,
    });
    process.on('exit', () => server.kill('SIGTERM'));
    return server;
  }

  let server = start();

  // Watch for changes and restart server
  watch('./dist/server.js').then(watcher => {
    watcher.on('changed', () => {
      server.kill('SIGTERM');
      server = start();
    });
  });
};
