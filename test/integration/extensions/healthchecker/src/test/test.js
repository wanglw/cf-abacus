'use strict';

const dbclient = require('abacus-dbclient');
const lifecycleManager = require('abacus-lifecycle-manager')();
const request = require('abacus-request');

const testEnv = {
  db: process.env.DB_URI,
  startTimeout: process.env.START_TIMEOUT || 5000
};

describe('healthchecker integration test', function() {
  this.timeout(testEnv.startTimeout);

  before((done) => {
    const modules = [lifecycleManager.modules.authServerPlugin, lifecycleManager.modules.eurekaPlugin];

    const startModules = () => {
      lifecycleManager.startModules(modules);
      request.waitFor('http://localhost::p', { p: 9882 }, testEnv.startTimeout, (err, value) => done(err));
    };

    dbclient.drop(testEnv.db, /^abacus-/, startModules);
  });

  after(() => {
    lifecycleManager.stopAllStarted();
  });

  it('responds healthy', (done) => {
    request.get(
      'http://localhost:9990/healthcheck',
      {
        auth: {
          user: 'testUser',
          password: 'testPassword'
        }
      },
      (err, response) => {
        expect(response.statusCode).to.equal(200);
        expect(response.body).to.deep.equal({ healthy: true });
        done(err);
      }
    );
  });
});
