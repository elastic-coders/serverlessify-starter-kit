# Auth0 Serverless Authorizer

This is an [API GAteway Lambda custom authorizer](http://docs.aws.amazon.com/apigateway/latest/developerguide/use-custom-authorizer.html)
that authenticates with [Auth0](https://auth0.com).

It provides bot a aready to use authorizer as well as libraries to write your
custom authorizers using Auth0.

## Conventions

If the provided `defaultAuthorizer` is used for an API, the following conventions
are used:

- All urls starting with `/user/{userId}/...` are allowed only to the user with
  the given `userId` (where `userId` is the Auth0 user `user_id` field value)
  or to users in the `Admin` authorization group
  (See the [Auth0 Authorization Extension](https://auth0.com/docs/extensions/authorization-extension))
- All urls starting with `/admin/...` are allowd only to users in the `Admin`
  authorization group
- All other urls are Allowed only to logged in users

If you endpoint needs different authorizations, you will need to write a custom
authorizer as follows.

## Custom Auth0 authorizer

TODO
