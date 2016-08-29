# [Serverlessify](https://github.com/elastic-coders/serverlessify) Backend Starter Kit

A production ready node API backend organized in Serverless projects and served
by an Express server as if it was on AWS. The starter kit provide:

- [Auth0](https://auth0.com/) authorizer with default url structure check
- [Local DynamoDB](https://github.com/Medium/local-dynamo) auto-generation for testing
- Dockerfile ready for production artifact generation
- CLI interface template to use and integration test developed APIs
- Unit test ready
- [Devtool](https://github.com/Jam3/devtool) support

## Usage

Install dependencies and run the dev server:

```
npm install
npm start
```

You should see the database started and prepared for usage as well as the
endpoints exposed by the backend.

Use `help` with any command (like `npm start help`) to see available options.
Command options are specified with columns like `npm run image release tag:latest`.

## Documentation

Check the [Serverlessify documentation](https://github.com/elastic-coders/serverlessify)
to see how the server is started. Refer to readmes in the Serverless projects
for endpoint specific documentation.

To create a new sub-project do this:

1. Create a folder in the `src`
2. Indie that folder use `serverless create -t aws-nodejs`
3. Edit the created `serverless.yml` to your liking, see the [example-user](./src/sls-xample-user)
   service to see how to add DynamoDB tables, fixtures and endpoints
4. Add the new Serverless project to the [`server.js`](./src/server/server.js)
   file like so:

   ```javascript
   sls(
     require('../my-project/serverless.yml'),
     { handler: require('../my-project/handler.js') }
   );
   ```
5. Start the server and see you new enpoints being served

More useful documentation is:

- [Auth0 Authorizer](./src/sls-auth0-authorizer)
- [AWS SDK DynamoDB DocumentClient Documentation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html)
