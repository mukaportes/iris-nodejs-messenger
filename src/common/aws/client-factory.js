const AWS = require('aws-sdk');

/** @private */
function endpointOptions(endpoint) {
  /* istanbul ignore next */
  if (!endpoint) {
    return {};
  }

  return {
    endpoint: new AWS.Endpoint(endpoint),
  };
}

module.exports = {
  create(service, credentials = {}) {
    return new AWS[service.toUpperCase()]({
      ...endpointOptions(process.env[`${service.toUpperCase()}_ENDPOINT`]),
      region: process.env.AWS_REGION,
      ...credentials,
    });
  },
};
