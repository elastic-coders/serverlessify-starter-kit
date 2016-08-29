import express from 'express';
import serverlessify from './serverlessify';
import AuthCache from './AuthCache';
import colors from 'colors/safe';

export default function createServer() {
  console.log(colors.gray('Serving:'));

  const http = express();
  const authCache = new AuthCache();

  http.set('port', (process.env.PORT || 3000));
  http.set('trust proxy', true);

  const sls = serverlessify({
    http,
    authCache,
    authorizers: {
      'auth0-authorizer:authorize': (event, context, cb) =>
        sls.getFunction('auth0-authorizer', 'authorize')(event, context, cb),
    },
  });

  // Base auth0 authorizer
  sls(
    require('../sls-auth0-authorizer/serverless.yml'),
    { handler: require('../sls-auth0-authorizer/handler.js') }
  );

  sls(
    require('../sls-example-user/serverless.yml'),
    { handler: require('../sls-example-user/handler.js') }
  );

  const startServer = () => http.listen(http.get('port'), () => {
    console.log(colors.green('🌍  Http server running http://0.0.0.0:' + http.get('port'))); // eslint-disable-line no-console
    if (process.send) {
      process.send('online');
    }
  });

  return {
    http,
    authCache,
    sls,
    startServer,
  };
}
