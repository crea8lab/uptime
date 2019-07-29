/*
* Routes definitions
* Built by Favour George
* 29th July 2019
*
*/

// Dependencies
const handlers = require('../controller/controls')

// Define a request router
const router = {
  'ping': handlers.ping
}

module.exports = router
