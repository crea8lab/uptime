/*
* Controllers for the routes
* Built by Favour George
* 29th July 2019
*
*/

// Define handlers
const handlers = {
  // Sample handler
  ping: (data, cb) => cb(200),

  // Not found handler
  notFound: (data, cb) => cb(404)
}

module.exports = handlers
