import AWS from 'aws-sdk';

const dbOpts = process.env.NODE_ENV === 'production' ? {} : {
  region: 'eu-west-1',
  endpoint: new AWS.Endpoint(
    process.env.DYNAMODB_ENDPOINT_URL || '<INVALID>'
  ),
};
const db = new AWS.DynamoDB.DocumentClient(dbOpts);

export const hello = async (event) => {
  const user = await db.get({
    TableName: 'dev-example-user-user',
    Key: {
      userId: event.path.userId,
    },
  }).promise().then(resp => resp.Item);
  // await callService('example-greet.greet')
  return `Hello ${user.firstname} ${user.lastname}`;
};

function generatePolicy(principalId, effect, resource) {
  const authResponse = {};
  authResponse.principalId = principalId;
  if (effect && resource) {
    const policyDocument = {};
    policyDocument.Version = '2012-10-17'; // default version
    policyDocument.Statement = [];
    const statementOne = {};
    statementOne.Action = 'execute-api:Invoke'; // default action
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
}

// This is an example custom authorizer
export const authorizer = (event, context, cb) => {
  const token = (
    /Bearer (.*)/.exec(event.authorizationToken) ||
    [null, event.authorizationToken]
  )[1];
  switch (token) {
    case 'allow':
      cb(null, generatePolicy('user', 'Allow', event.methodArn));
      break;
    case 'deny':
      cb(null, generatePolicy('user', 'Deny', event.methodArn));
      break;
    case 'unauthorized':
      cb(new Error('Unauthorized'));
      break;
    default:
      cb(new Error('error'));
  }
};
