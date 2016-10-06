import {
  getMethodScope,
  generateAuthorizer,
  getBearerToken,
  getAuth0Client,
  getUserInfo,
} from './lib/utils';

let auth0;
const ACCESS_TOKEN_LENGTH = 16;

export function defaultAuthorizer(event) {
  const methodScope = getMethodScope(event.methodArn);
  const getAuthorization = generateAuthorizer({
    resource: event.methodArn,
    onlyUserId: methodScope.userId,
    isPublic: methodScope.isPublic,
  });

  const token = getBearerToken(event);

  // TODO try to validate the JWT instead using the secret token (saves a call to auth0)

  if (!auth0) {
    auth0 = getAuth0Client();
  }

  let getTokenDataPromise;
  if (token.length === ACCESS_TOKEN_LENGTH) { // Auth0 v1 access_token (deprecated)
    getTokenDataPromise = auth0.users.getInfo(token);
  } else if (token.length > ACCESS_TOKEN_LENGTH) { // (probably) Auth0 id_token
    getTokenDataPromise = auth0.tokens.getInfo(token);
  } else {
    throw new TypeError('Bearer token too short - expected >= 16 charaters');
  }

  return getTokenDataPromise
    .then(getUserInfo)
    .then(getAuthorization);
}
