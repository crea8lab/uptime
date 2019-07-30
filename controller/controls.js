/*
* Controllers for the routes
* Built by Favour George
* 29th July 2019
*
*/

// Dependencies
const _data = require('../lib/data')
const { valildateFields, hashPassword } = require('../lib/helpers')

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

  // Not found handler
  notFound: (data, cb) => cb(404)
}

module.exports = handlers
