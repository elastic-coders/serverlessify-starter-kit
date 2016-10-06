/* eslint-disable no-console,import/no-extraneous-dependencies */
import localDynamo from 'local-dynamo';
import colors from 'colors/safe';

export default async (args = {}) => {
  const { inMemory, port } = Object.assign(
    {
      inMemory: false,
      port: 4567,
    },
    args
  );

  console.log(colors.yellow(`Start ${inMemory ? 'in memory' : 'local'} DB...`));

  if (args.help) {
    console.log('  Start the local dev database. Options:');
    console.log(`  ${colors.gray('port')}: Local DynamoDB server port (${port})`);
    console.log(`  ${colors.gray('inMemory')}: Use in memory local DynamoDB (${inMemory})`);
    return args;
  }

  const dynamodb = localDynamo.launch({
    dir: inMemory ? null : './',
    port,
    sharedDb: true,
  });
  process.on('exit', () => dynamodb.kill('SIGTERM'));

  const endpoint = `http://localhost:${port}`;
  process.env.DYNAMODB_ENDPOINT_URL = endpoint;

  console.log(`  Local DynamoDB running at endpoint ${colors.gray(endpoint)}`);
  console.log(`  Local DynamoDB shell at ${colors.gray(`${endpoint}/shell`)}`);
  console.log(`  DYNAMODB_ENDPOINT_URL has been set to ${colors.gray(endpoint)}`);

  return args;
};
