/*
* Controllers for the routes
* Built by Favour George
* 29th July 2019
*
*/

// Dependencies
const _data = require('../lib/data')
const helpers = require('../lib/helpers')

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
    get: (data, cb) => {},

    // Post request
    /*
    * @params: firstName, lastName, phone, password, tosAgreement
    * @Optional data: none
    */
    post: ({ payload }, cb) => {
      // Validate required params
      const firstName = typeof(payload.firstName) === 'string' && payload.firstName.trim().length > 0 ? payload.firstName.trim() : false
      const lastName = typeof(payload.lastName) === 'string' && payload.lastName.trim().length > 0 ? payload.lastName.trim() : false
      const phone = typeof(payload.phone) === 'string' && payload.phone.trim().length === 11 ? payload.phone.trim() : false
      const password = typeof(payload.password) === 'string' && payload.password.trim().length > 0 ? payload.password.trim() : false
      const tosAgreement = typeof(payload.tosAgreement) === 'boolean' && payload.tosAgreement === true ? true : false

      if (firstName && lastName && phone && password && tosAgreement) {
        // Check to see if user exists
        _data.read('users', phone, (err, data) => {
          if (err) {
            // Hash the password
            const hashedPassword = helpers.hash(password)

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
    put: (data, cb) => {},

    // Delete request
    delete: (data, cb) => {},
  },

  // Not found handler
  notFound: (data, cb) => cb(404)
}

module.exports = handlers
