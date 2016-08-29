import server from './server';

const backend = {
  server,
};

export default backend;

let serverInstance;
let serverListener;
if (process.argv.indexOf('startServer') > 0) {
  serverInstance = backend.server.createServer();
  serverListener = serverInstance.startServer();
}

if (process.argv.indexOf('exportGlobals') > 0) {
  global.backend = backend;
  if (serverListener) {
    global.backendServerInstance = serverInstance;
    global.backendServerListener = serverListener;
  }
}
