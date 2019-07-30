/*
* Helpers for various tasks
* Built by Favour George
* 30th July 2019
*
*/

// Dependencies
const crypto = require('crypto');
const config = require('../config/config');

// Container for all the helpers
const helpers = {
  // Hash user password
  hash: str => {
    if (typeof(str) === 'string' && str.length > 0) {
      return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
    } else {
      return false
    }
  },

  // parse the JSON string to an object in all cases without throwing errors
  parseJsonToObject: str => {
    try {
      return obj = JSON.parse(str)
    } catch (e) {
      return {}
    }
  }
}

module.exports = helpers
