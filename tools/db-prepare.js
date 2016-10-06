/* eslint-disable no-console,import/no-extraneous-dependencies */
import colors from 'colors/safe';
import glob from 'glob';
import path from 'path';
import R from 'ramda';
import AWS from 'aws-sdk';
import { isServerless, loadServerless } from './lib/sls';

export default async (args = {}) => {
  console.log(colors.yellow('Prepare DB...'));

  const { projectPath, stage, region, dbEndpoint, dropExistingTables } = Object.assign(
    {
      projectPath: path.join(__dirname, '../src/*/'),
      dbEndpoint: process.env.DYNAMODB_ENDPOINT_URL || '<INVALID>',
      dropExistingTables: false,
    },
    args
  );

  if (args.help) {
    console.log('  Prepare the DB by creating tables. Options:');
    console.log(`  ${colors.gray('projectPath')}: Path of Serverless projects, can use wildcards (${projectPath})`);
    console.log(`  ${colors.gray('stage')}: Serverless stage (${stage})`);
    console.log(`  ${colors.gray('region')}: Serverless region (${region})`);
    console.log(`  ${colors.gray('dbEndpoint')}: Database endpoint (${dbEndpoint})`);
    console.log(`  ${colors.gray('dropExistingTables')}: Delete tables instead of keeping existing ones (${dropExistingTables})`);
    return args;
  }

  const env = {};
  if (stage) {
    env.stage = stage;
  }
  if (region) {
    env.region = region;
  }

  const dbTableConfigs = R.flatten(glob
    .sync(projectPath, {})
    .filter(isServerless)
    .map(s => loadServerless(s, env))
    .map((svs) => {
      const resources = R.path(['resources', 'Resources'], svs);
      if (!resources) {
        return [];
      }
      const res = [];
      Object.keys(resources).forEach((k) => {
        if (resources[k].Type === 'AWS::DynamoDB::Table') {
          res.push(resources[k].Properties);
        }
      });
      return res;
    })
  );

  const db = new AWS.DynamoDB({
    region: 'eu-west-1',
    endpoint: new AWS.Endpoint(dbEndpoint),
  });

  const existingTables = await db.listTables().promise().then(R.path(['TableNames']));

  await Promise.all(Object.keys(dbTableConfigs).map(async (tableConf) => {
    if (existingTables.indexOf(tableConf.TableName) >= 0) {
      if (dropExistingTables) {
        console.log(`  Table ${colors.gray(tableConf.TableName)} deletion`);
        await db.deleteTable({ TableName: tableConf.TableName }).promise();
      } else {
        console.log(`  Table ${colors.gray(tableConf.TableName)} already existing`);
        return;
      }
    }
    console.log(`  Table ${colors.gray(tableConf.TableName)} creation`);
    await db.createTable(tableConf).promise();
  }));

  return args;
};
