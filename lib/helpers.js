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
  },

  // Validate user required fields
  valildateFields: payload => {
    const firstName = typeof(payload.firstName) === 'string' && payload.firstName.trim().length > 0 ? payload.firstName.trim() : false
    const lastName = typeof(payload.lastName) === 'string' && payload.lastName.trim().length > 0 ? payload.lastName.trim() : false
    const phone = typeof(payload.phone) === 'string' && payload.phone.trim().length === 11 ? payload.phone.trim() : false
    const password = typeof(payload.password) === 'string' && payload.password.trim().length > 0 ? payload.password.trim() : false
    const tosAgreement = typeof(payload.tosAgreement) === 'boolean' && payload.tosAgreement === true ? true : false

    return {
      firstName, lastName, phone, password, tosAgreement
    }
  }
}

module.exports = helpers
