import chai, { expect } from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';
chai.use(require('sinon-chai'));

import makeAuth0Mock from './auth0.mock.js';

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
    auth0Mock._resetSpies();
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
