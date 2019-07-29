/*
* Primary file for the API
* Built by Favour George
*
*/

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder
const config = require('./config/config');

// Lib functions
const { parsedJson } = require('./lib/parsedJson')

// The server should respond to all request with a string
const server = http.createServer((req, res) => {

  //  Get the URL and parse it
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname
  const trimmedPath = path.replace(/^\/+|\/+$/g, '')

  // Get the query string as an object
  const queryStringObject = parsedJson(parsedUrl.query)

  // Get the headers
  const headers = parsedJson(req.headers)

  // Get the HTTP method
  const method = req.method.toLowerCase()

  // Get the payload, if any
  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', (data) => {
    buffer += decoder.write(data)
  })

  req.on('end', () => {
    buffer += decoder.end()

    // Choose the handler this request should go to. if one is not existing use notFound
    const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

    // construct the data obj to send to the handler
    const data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer
    }

    // Route the request to the handler specified
    chosenHandler(data, function(statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200

      // Use the payload called back by the handler, or default to {}
      payload = typeof(payload) === 'object' ? payload : {}

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload)

      // Return the response
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(statusCode)
      res.end(payloadString)

      // Log the request path
      console.log('Returning response: ', statusCode, parsedJson(payload));
    })
  })
});

// Start the server
server.listen(config.port, () => console.log(`The serve is running on port: ${config.port} in ${config.envName} mode`))

// Define handlers
const handlers = {}

// Sample handler
handlers.sample = function (data, cb) {
  // Callback a http status code, and a payload object
  cb(406, {'name': 'sample handler'})

}

// Not found handler
handlers.notFound = function (data, cb) {
  cb(404)
}

// Define a request router
const router = {
  'sample': handlers.sample
}
