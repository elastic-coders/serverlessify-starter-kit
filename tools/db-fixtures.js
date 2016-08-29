import colors from 'colors/safe';
import path from 'path';
import glob from 'glob';
import fs from 'fs';
import AWS from 'aws-sdk-promise';
import R from 'ramda';

export default async (args = {}) => {
  console.log(colors.yellow(`Load DB fixtures...`)); // eslint-disable-line no-console

  const { fixtureFiles, dbEndpoint } = Object.assign(
    {
      fixtureFiles: path.join(__dirname, '../src/*/fixtures.json'),
      dbEndpoint: process.env.DYNAMODB_ENDPOINT_URL || '<INVALID>',
    },
    args
  );

  if (args.help) {
    console.log('  Load fixtures in the local database. Options:');
    console.log(`  ${colors.gray('fixtureFiles')}: Fixture files path, can use wildcards (${fixtureFiles})`);
    console.log(`  ${colors.gray('dbEndpoint')}: Database endpoint (${dbEndpoint})`);
    return;
  }

  const requestsItems = R.flatten(glob
    .sync(fixtureFiles)
    .map(f => JSON.parse(fs.readFileSync(f, 'utf8')))
    .map(f => {
      const RequestItems = {};
      for (let TableName in f) {
        RequestItems[TableName] = f[TableName].map(Item => ({ PutRequest: { Item } }));
      }
      return RequestItems;
    })
  );

  const db = new AWS.DynamoDB.DocumentClient({
    region: 'eu-west-1',
    endpoint: new AWS.Endpoint(
      dbEndpoint || process.env.DYNAMODB_ENDPOINT_URL || 'error'
    ),
  });

  for (let RequestItems of requestsItems) {
    console.log(`  Add fixtures for ${colors.gray(R.keys(RequestItems).join(', '))}`)
    await db
      .batchWrite({
        RequestItems,
        ReturnItemCollectionMetrics: 'COUNT',
      })
      .promise()
      .catch(err => {
        console.error(err);
      });
  }
};
