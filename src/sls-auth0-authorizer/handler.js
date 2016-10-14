import {
  getMethodScope,
  generateAuthorizer,
  getBearerToken,
  getUserInfo,
  getTokenData,
} from './lib/utils';

export function defaultAuthorizer(event) {
  const methodScope = getMethodScope(event.methodArn);
  const getAuthorization = generateAuthorizer({
    resource: event.methodArn,
    onlyUserId: methodScope.userId,
    isPublic: methodScope.isPublic,
  });

  const token = getBearerToken(event);

  // TODO try to validate the JWT instead using the secret token (saves a call to auth0)

  return getTokenData(token)
    .then(getUserInfo)
    .then(getAuthorization);
}
