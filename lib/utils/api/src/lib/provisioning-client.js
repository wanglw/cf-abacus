'use strict';

const util = require('util');
const request = require('request');
const httpStatus = require('http-status-codes');
const { buildPath } = require('./url');
const { APIError, ConflictError, TooManyRequestsError } = require('./errors');

const doPost = util.promisify(request.post);

class ProvisioningClient {
  constructor(url, authHeaderProvider, skipSslValidation) {
    this.url = url;
    this.authHeaderProvider = authHeaderProvider;
    this.skipSslValidation = skipSslValidation;
  }

  async mapMeteringPlan(resourceID, planID, meteringPlan) {
    await this._doMapping(buildPath(
      'v1',
      'provisioning',
      'mappings',
      'metering',
      'resources',
      resourceID,
      'plans',
      planID,
      meteringPlan
    ));
  }

  async mapRatingPlan(resourceID, planID, ratingPlan) {
    await this._doMapping(buildPath(
      'v1',
      'provisioning',
      'mappings',
      'rating',
      'resources',
      resourceID,
      'plans',
      planID,
      ratingPlan
    ));
  }

  async mapPricingPlan(resourceID, planID, pricingPlan) {
    await this._doMapping(buildPath(
      'v1',
      'provisioning',
      'mappings',
      'pricing',
      'resources',
      resourceID,
      'plans',
      planID,
      pricingPlan
    ));
  }

  async _doMapping(path) {
    const res = await doPost(path, {
      baseUrl: this.url,
      rejectUnauthorized: !this.skipSslValidation,
      forever: true,
      headers: {
        authorization: this.authHeaderProvider.getHeader()
      }
    });

    switch (res.statusCode) {
      case httpStatus.OK:
        return;
      case httpStatus.CONFLICT:
        throw new ConflictError();
      case httpStatus.TOO_MANY_REQUESTS:
        throw new TooManyRequestsError(parseInt(res.headers['retry-after']) || 0);
      default:
        throw new APIError(`expected status code 200 but was ${res.statusCode}`);
    }
  }
};

module.exports = {
  ProvisioningClient
};
