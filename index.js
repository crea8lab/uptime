/*
* Primary server logics
* Built by Favour George
* 29th July 2019
*
*/

// Dependencies
const http = require('http');
const https = require('https')
const config = require('./config/config');
const fs = require('fs')

// Lib functions
const { unifiedServer } = require('./lib/unifiedServer')

// Instantiate the http server
const httpServer = http.createServer((req, res) => unifiedServer(req, res));

// Start the server
httpServer.listen(config.httpPort, () => console.log(`The serve is running on port: ${config.httpPort} in ${config.envName} mode`))

// Instantiate the https server
const httpsServerOptions = {
    'key' : fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
}

const httpsServer = https.createServer(httpsServerOptions, (req, res) => unifiedServer(req, res))

// Start the https server
httpsServer.listen(config.httpsPort, () => console.log(`The server is running on port: ${config.httpsPort} in ${config.envName} mode`))
