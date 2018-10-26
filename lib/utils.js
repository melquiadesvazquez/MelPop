'use strict';

module.exports.isAPI = function (req) {
  return req.originalUrl.indexOf('/apiv') === 0;
}

module.exports.isWeb = function (req) {
  return req.originalUrl.indexOf('/ads') === 0;
}

module.exports.isSubset = function (subset, superset) {
  // the subset parameter could be an string or an array
  const elements = [].concat(subset || []);

  return elements.every(function (value) {
    return (superset.indexOf(value) >= 0);
  });
}
