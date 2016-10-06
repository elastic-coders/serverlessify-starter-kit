/* eslint-disable global-require,import/no-extraneous-dependencies */
import { expect } from 'chai';
import mockery from 'mockery';

import makeAuth0Mock from './auth0.mock';

describe('auth0-authorizer/utils', () => {
  let auth0Mock;
  let module;

  before(() => {
    mockery.enable({ warnOnUnregistered: false });
    auth0Mock = makeAuth0Mock();
    mockery.registerMock('auth0', auth0Mock);
    //
    module = require('../lib/utils');
  });

  after(() => {
    mockery.disable();
    mockery.deregisterAll();
  });

  beforeEach(() => {
    auth0Mock.$resetSpies();
  });

  it('should define utils functions', () => {
    expect(module.getAuth0Client).to.be.a('function');
    expect(module.getMethodScope).to.be.a('function');
    expect(module.getBearerToken).to.be.a('function');
    expect(module.getUserInfo).to.be.a('function');
    expect(module.generatePolicyDocument).to.be.a('function');
  });

  // TODO more tests
});
