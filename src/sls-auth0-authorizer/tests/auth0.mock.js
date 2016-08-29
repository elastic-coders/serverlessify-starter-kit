const sinon = require('sinon');

const AuthenticationClientMock = {
  users: {
    getInfo: sinon.spy(),
  },
  tokens: {
    getInfo: sinon.spy(),
  },
};
const AuthenticationClient = sinon.stub().returns(AuthenticationClientMock);

const auth0Mock = {
  AuthenticationClient,
  _resetSpies() {
    AuthenticationClientMock.users.getInfo.reset();
    AuthenticationClientMock.tokens.getInfo.reset();
  },
};

module.exports = () => auth0Mock;
