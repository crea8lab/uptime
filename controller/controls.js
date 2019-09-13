/*
* Controllers for the routes
* Built by Favour George
* 29th July 2019
*
*/

// Dependencies
const _data = require('../lib/data')
const { valildateFields, hashPassword, createRandomString } = require('../lib/helpers')

// Define handlers
const handlers = {
  // Ping...
  ping: (data, cb) => cb(200),

  // Users
  users: (data, cb) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete']

    if (acceptableMethods.indexOf(data.method) > -1) {
      handlers._users[data.method](data, cb)
    } else {
      cb(405)
    }
  },

  // Users sub-methods
  _users: {
    // Get request
    /*
    * @params: phone
    * @Optional data: none
    * @TODO only auth users can access their data.
    */
    get: ({ queryStringObject }, cb) => {
      // Check that the phone number is valid
      const { phone } = valildateFields(queryStringObject)

      if (phone) {
        // Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // Remove the hashed password from the obj.
            delete data.password
            cb(200, data)
          } else {
            cb(404, {
              'Error': `User with ${phone} not found in our DB`
            })
          }
        })
      } else {
        cb(400, {
          'Error': 'Missing required field'
        })
      }
    },

    // Post request
    /*
    * @params: firstName, lastName, phone, password, tosAgreement
    * @Optional data: none
    */
    post: ({ payload }, cb) => {
      // Validate required params
      const { firstName, lastName, phone, password, tosAgreement} = valildateFields(payload)

      if (firstName && lastName && phone && password && tosAgreement) {
        // Check to see if user exists
        _data.read('users', phone, (err, data) => {
          if (err) {
            // Hash the password
            const hashedPassword = hashPassword(password)

            if (hashedPassword) {
              // Create the user object
              const userDetails = {
                firstName,
                lastName,
                phone,
                tosAgreement,
                password: hashedPassword
              }

              // Store the user
              _data.create('users', phone, userDetails, (err) => {
                if (!err) {
                  cb(200)
                } else {
                  console.log(err)
                  cb(500, {
                    'Error': 'Could not create the new user'
                  })
                }
              })
            } else {
              cb(500, {
                'Error': 'Could not hash the user\'s password'
              })
            }

          } else {
            // user already exists
            cb(400, {
              'Error': 'A user with that phone number already exists'
            })
          }
        })
      } else {
        cb(400, {
          'Error': 'Missing required fields'
        })
      }
    },

    // Put request
    /*
    * @params: phone
    * @Optional data: firstName, lastName, password, tosAgreement
    * @TODO only auth users can access their data.
    */
    put: ({ payload }, cb) => {
      let { firstName, lastName, phone, password, tosAgreement} = valildateFields(payload)

      // Cancel if no phone is provided
      if (phone) {
        // See if update fields exist
        if (firstName || lastName || tosAgreement) {
          // Look up the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              password = hashPassword(password)
              userData = {...userData, firstName, lastName, tosAgreement, password}

              // Store the data
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  cb(200)
                } else {
                  console.log(err);
                  cb(500, {
                    'Error': 'Could not update the user data'
                  })
                }
              })
            } else {
              cb(404, {
                'Error': 'The specified user does not exist'
              })
            }
          })
        } else {
          cb(400, {
            'Error': 'Missing fields to update'
          })
        }

      } else {
        cb(400, {
          'Error': 'Missing required field'
        })
      }
    },

    // Delete request
    /*
    * @params: phone
    * @Optional data: none
    * @TODO only auth users can access their data.
    * @TODO Delete other related files associated with this user.
    */
    delete: ({ queryStringObject }, cb) => {
      // Check that the phone number is valid
      const { phone } = valildateFields(queryStringObject)

      if (phone) {
        // Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            _data.delete('users', phone, err => {
              if (!err) {
                cb(200)
              } else {
                cb(500, {'Error': 'Could not delete the specified user'})
              }
            })
          } else {
            cb(404, {
              'Error': `User with ${phone} not found in our DB`
            })
          }
        })
      } else {
        cb(400, {
          'Error': 'Missing required field'
        })
      }
    },
  },

  // Tokens
  tokens: (data, cb) => {
    const acceptableMethods = ['post', 'get', 'put', 'delete']

    if (acceptableMethods.indexOf(data.method) > -1) {
      handlers._tokens[data.method](data, cb)
    } else {
      cb(405)
    }
  },

  // Tokens sub-methods
  _tokens: {
    // Get request
    /*
    * @params: phone
    * @Optional data: none
    * @TODO only auth users can access their data.
    */
    get: ({ queryStringObject }, cb) => {
      // Check that the phone number is valid
      const { phone } = valildateFields(queryStringObject)

      if (phone) {
        // Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            // Remove the hashed password from the obj.
            delete data.password
            cb(200, data)
          } else {
            cb(404, {
              'Error': `User with ${phone} not found in our DB`
            })
          }
        })
      } else {
        cb(400, {
          'Error': 'Missing required field'
        })
      }
    },

    // Post request
    /*
    * @params: phone, password
    * @Optional data: none
    *
    */
    post: ({ payload }, cb) => {
      // Validate required params
      const { phone, password } = valildateFields(payload)

      if (phone && password) {
        // Look up the user who matches the provided phone number
        _data.read('users', phone, (err, userData) => {
          if (!err && userData) {
            // Hash the password and compare it with existing password in db
            const hashedPassword = hashPassword(password)
            console.log(hashedPassword);
            console.log(userData.password);
            console.log(hashPassword === userData.password);

            if (hashPassword === userData.password) {
              // Create token and set expiration to 1hr
              const tokenId = createRandomString(20)
              const expires = Date.now() + 1000 * 60 * 60

              const tokenDetails = {
                phone,
                id: tokenId,
                expires
              }

              // Store data
              _data.create('tokens', tokenId, tokenDetails, (err) => {
                if (!err) {
                  cb(200, tokenDetails)
                } else {
                  cb(500, {
                    'Error': 'Could not create the new token'
                  })
                }
              })
            } else {
              cb(400, {
                'Error': 'Password does not match the specified user details'
              })
            }
          } else {
            // user already exists
            cb(404, {
              'Error': 'No User with such number exists'
            })
          }
        })
      } else {
        cb(400, {
          'Error': 'Missing required fields'
        })
      }
    },

    // Put request
    /*
    * @params: phone
    * @Optional data: firstName, lastName, password, tosAgreement
    * @TODO only auth users can access their data.
    */
    put: ({ payload }, cb) => {
      let { firstName, lastName, phone, password, tosAgreement} = valildateFields(payload)

      // Cancel if no phone is provided
      if (phone) {
        // See if update fields exist
        if (firstName || lastName || tosAgreement) {
          // Look up the user
          _data.read('users', phone, (err, userData) => {
            if (!err && userData) {
              password = hashPassword(password)
              userData = {...userData, firstName, lastName, tosAgreement, password}

              // Store the data
              _data.update('users', phone, userData, (err) => {
                if (!err) {
                  cb(200)
                } else {
                  console.log(err);
                  cb(500, {
                    'Error': 'Could not update the user data'
                  })
                }
              })
            } else {
              cb(404, {
                'Error': 'The specified user does not exist'
              })
            }
          })
        } else {
          cb(400, {
            'Error': 'Missing fields to update'
          })
        }

      } else {
        cb(400, {
          'Error': 'Missing required field'
        })
      }
    },

    // Delete request
    /*
    * @params: phone
    * @Optional data: none
    * @TODO only auth users can access their data.
    * @TODO Delete other related files associated with this user.
    */
    delete: ({ queryStringObject }, cb) => {
      // Check that the phone number is valid
      const { phone } = valildateFields(queryStringObject)

      if (phone) {
        // Look up the user
        _data.read('users', phone, (err, data) => {
          if (!err && data) {
            _data.delete('users', phone, err => {
              if (!err) {
                cb(200)
              } else {
                cb(500, {'Error': 'Could not delete the specified user'})
              }
            })
          } else {
            cb(404, {
              'Error': `User with ${phone} not found in our DB`
            })
          }
        })
      } else {
        cb(400, {
          'Error': 'Missing required field'
        })
      }
    },
  },

  // Not found handler
  notFound: (data, cb) => cb(404)
}

module.exports = handlers
