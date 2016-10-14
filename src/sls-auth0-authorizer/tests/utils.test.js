/* eslint-disable global-require,import/no-extraneous-dependencies */
import { expect } from 'chai';
import mockery from 'mockery';
import { AuthenticationClient } from 'auth0';

import makeAuth0Mock from './auth0.mock';

describe('auth0-authorizer/utils', () => {
  let auth0Mock;
  let module;

  before(() => {
    mockery.enable({ warnOnUnregistered: false, useCleanCache: true });
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
    expect(module.getTokenData).to.be.a('function');
    expect(module.getUserInfo).to.be.a('function');
    expect(module.generatePolicyDocument).to.be.a('function');
  });

  describe('getAuth0Client', () => {
    let getAuth0Client;

    before(() => {
      mockery.disable();
      getAuth0Client = require('../lib/utils').getAuth0Client;
    });

    after(() => {
      mockery.enable();
    });

    it('should throw error if AUTH0_DOMAIN env is not set', () => {
      expect(getAuth0Client).to.throw(Error, /Expected AUTH0_DOMAIN environment variable/);
    });

    it('should throw error if AUTH0_DOMAIN env is not set', () => {
      process.env.AUTH0_DOMAIN = 'mydomain.auth0.com';
      expect(getAuth0Client).to.throw(Error, /Expected AUTH0_CLIENT_ID environment variable/);
    });

    it('should return an `AuthenticationClient` instance', () => {
      process.env.AUTH0_DOMAIN = 'testDomain.auth0.com';
      process.env.AUTH0_CLIENT_ID = 'testAppClientId';
      expect(getAuth0Client()).to.be.an.instanceof(AuthenticationClient);
      delete process.env.AUTH0_DOMAIN;
      delete process.env.AUTH0_CLIENT_ID;
    });
  });

  describe('getMethodScope method', () => {
    it('should return method scope', () => {
      const methodArn = 'arn:aws:execute-api:express:serverlessify:agent-create/dev/POST/user/99';
      const scope = module.getMethodScope(methodArn);
      expect(scope).to.be.an.instanceof(Object);
      expect(scope).to.have.property('verb').and.equal('POST');
      expect(scope).to.have.property('area').and.equal('user');
      expect(scope).to.have.property('extra').and.equal('99');
      expect(scope).to.have.property('userId').and.equal('99');
      expect(scope).to.have.property('isPublic').and.equal(false);
      expect(scope).to.have.property('isAdmin').and.equal(false);
    });
  });

  describe('getBearerToken method', () => {
    it('should throw error when called with invalid params', () => {
      const typeErrorRegexp = /Expected `event.type` parameter to have value TOKEN/;
      const missingTokenRegexp = /Expected `event.authorizationToken` parameter to be set/;
      const invalidTokenRegexp = /Invalid Authorization token/;
      expect(module.getBearerToken.bind(null, {})).to.throw(Error, typeErrorRegexp);
      expect(module.getBearerToken.bind(null, { type: 'WRONG' })).to.throw(Error, typeErrorRegexp);
      expect(module.getBearerToken.bind(null, { type: 'TOKEN' })).to.throw(Error, missingTokenRegexp);
      expect(module.getBearerToken.bind(null, {
        type: 'TOKEN',
        authorizationToken: 'invalid',
      })).to.throw(Error, invalidTokenRegexp);
    });

    it('should return parsed token', () => {
      const ev = { type: 'TOKEN', authorizationToken: 'Bearer xxxyyy' };
      expect(module.getBearerToken(ev)).to.be.equal('xxxyyy');
    });
  });

  describe('getTokenData method', () => {
    before(() => {
      process.env.AUTH0_DOMAIN = 'testDomain.auth0.com';
      process.env.AUTH0_CLIENT_ID = 'testAppClientId';
    });

    after(() => {
      delete process.env.AUTH0_DOMAIN;
      delete process.env.AUTH0_CLIENT_ID;
    });

    it('should throw error when called with invalid token', () => {
      expect(module.getTokenData.bind(null, 'xxxyyy')).to.throw(TypeError, /Bearer token too short/);
    });

    it('should call auth0 to get user data', () => {
      const accessToken = '1234567890abcdef';
      const jwtToken = '1234567890abcdefseaslkndw9e8yqriejofwiejfohf984';
      module.getTokenData(accessToken);
      expect(auth0Mock.AuthClientMock.users.getInfo.calledOnce).to.be.true;  // eslint-disable-line
      module.getTokenData(jwtToken);
      expect(auth0Mock.AuthClientMock.tokens.getInfo.calledOnce).to.be.true;  // eslint-disable-line
    });
  });

  describe('getUserInfo method', () => {
    it('should throw error when called with invalid data', () => {
      expect(module.getUserInfo).to.throw(Error, /No user_id returned from Auth0/);
    });

    it('should return user data in the proper format', () => {
      const auth0Resp = {
        email: 'test@auth.com',
        email_verified: false,
        user_id: 99,
        app_metadata: {
          authorization: {
            groups: ['tester', 'admin'],
          },
        },
      };
      const data = module.getUserInfo(auth0Resp);
      expect(data).to.have.property('email').and.equal('test@auth.com');
      expect(data).to.have.property('userId').and.equal(99);
      expect(data).to.have.property('isAdmin').and.equal(true);
      expect(data).to.have.property('emailVerified').and.equal(false);
    });
  });

  describe('generatePolicyDocument method', () => {
    it('should no return policyDocument when called without effect and resource', () => {
      const userId = 'auth0|57c49cf89a03438056df3759';
      const data = module.generatePolicyDocument(userId);
      expect(data).to.have.property('principalId').and.equal(userId);
      expect(data).not.to.have.property('policyDocument');
    });

    it('should return policyDocument', () => {
      const resource = 'arn:aws:execute-api:express:serverlessify:service/test/POST/user/signup';
      const userId = 'auth0|57c49cf89a03438056df3759';
      const data = module.generatePolicyDocument(userId, 'Allow', resource);
      expect(data).to.have.property('principalId').and.equal(userId);
      expect(data).to.have.property('policyDocument').and.instanceof(Object);
      const policy = data.policyDocument;
      expect(policy).to.have.property('Version').and.equal('2012-10-17');
      expect(policy).to.have.property('Statement').and.instanceof(Array);
      expect(policy.Statement[0]).to.have.property('Action').and.equal('execute-api:Invoke');
      expect(policy.Statement[0]).to.have.property('Effect').and.equal('Allow');
      expect(policy.Statement[0]).to.have.property('Resource').and.equal(resource);
    });
  });
});
