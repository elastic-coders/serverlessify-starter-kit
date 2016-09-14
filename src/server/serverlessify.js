import serverlessify from 'serverlessify';

const normalizeLambda = (func) => (event, context, cb) => new Promise((resolve, reject) =>
  Promise
    .resolve(func(event, context, (e, r) => e ? reject(e) : resolve(r)))
    .then(r => resolve(r), e => reject(e))
).then(
  resp => cb(null, resp),
  err => cb(err)
);

export default ({ http, authorizers, authCache }) => serverlessify({
  http: {
    eventHandler: (method, path, handlers) => {
      const normalizedMethod = method.toUpperCase();
      if (normalizedMethod !== 'OPTIONS') {
        console.log(`  ${normalizedMethod} - http://localhost:${http.get('port')}${path}`);
      }
      http[method](path, ...handlers)
    },
    wrapLambda: normalizeLambda,
    authorizers,
    authorizersCacheSet: authCache.setAuthCacheEntry,
    authorizersCacheGet: authCache.getAuthCacheEntry,
  },
});
