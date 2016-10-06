/* eslint-disable import/no-extraneous-dependencies */
import SlsVariables from 'serverless/lib/classes/Variables';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';

export function isServerless(dir) {
  try {
    const stats = fs.lstatSync(path.join(dir, 'serverless.yml'));
    return stats.isFile();
  } catch (e) {
    return false;
  }
}

export function loadServerless(dir, env) {
  const serverlessFilePath = path.join(dir, 'serverless.yml');
  let service = null;
  try {
    service = yaml.safeLoad(fs.readFileSync(serverlessFilePath, 'utf8'));
  } catch (e) {
    return service;
  }
  service.defaults = service.defaults || {};
  service.defaults.variableSyntax = service.defaults.variableSyntax || '\\$\\{(.+?)\\}';

  const { stage, region } = Object.assign(
    { stage: 'dev', region: 'eu-west-1' },
    service.provider || {},
    env || {}
  );
  const vars = new SlsVariables({ service });
  vars.populateService({ stage, region });

  return service;
}
