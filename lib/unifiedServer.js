/*
* Abstract the server creation logic
* Built by Favour George
* 29th July 2019
*
*/

// Dependencies
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder
const handlers = require('../controller/controls')
const router = require('../router/router');

// Lib functions
const { parsedJson } = require('./parsedJson')
const { parseJsonToObject } = require('./helpers')

module.exports = {
  // All the server logic for both the http and https server
  unifiedServer: (req, res) => {
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
        payload: parseJsonToObject(buffer)
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
  }
}
