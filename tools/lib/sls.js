import path from 'path';
import fs from 'fs';
import fse from 'fs-extra-promise';
import yaml from 'js-yaml';
import R from 'ramda';

const replaceVars = (matcher, vars) => obj => {
  if (typeof obj === 'number') {
    return obj;
  }
  if (typeof obj === 'string') {
    return obj.replace(matcher, (match, varName) => {
      const v = vars[varName];
      if (!v) {
        throw new Error(`Variable "${varName}" doesn't exist in serverless.env.yml.`);
      }
      return v;
    });
  }
  if (Array.isArray(obj)) {
    return obj.map(replaceVars(matcher, vars));
  }
  const res = {};
  for (let k in obj) {
    res[k] = replaceVars(matcher, vars)(obj[k]);
  }
  return res;
};

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
  const serverlessEnvFilePath = path.join(dir, 'serverless.env.yml');
  let sls = null;
  let slsEnv  = null;
  try {
    sls = yaml.safeLoad(fs.readFileSync(serverlessFilePath, 'utf8'));
    slsEnv = yaml.safeLoad(fs.readFileSync(serverlessEnvFilePath, 'utf8'));
  } catch (e) {
    return sls;
  }
  const { stage, region } = Object.assign(
    { stage: 'dev', region: 'eu-west-1' },
    sls.defaults || {},
    env || {}
  );
  const vars = Object.assign({},
    R.path(['vars'], slsEnv),
    R.path(['stages', stage, 'vars'], slsEnv),
    R.path(['stages', stage, 'region', region, 'vars'], slsEnv)
  );
  const varsMatcher = new RegExp(
    R.path(['defaults', 'variableSyntax'], sls) || '\\$\\{(.+?)\\}',
    'g'
  );
  return replaceVars(varsMatcher, vars)(sls);
}
