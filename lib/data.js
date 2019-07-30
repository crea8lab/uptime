/*
* Lib for storing and editing data
* Built by Favour George
* 29th July 2019
*
*/

// Dependencies
const fs = require('fs');
const path = require('path');
const { parseJsonToObject } = require('./helpers')

// Container for the module (to be exported)
const lib = {}

// Base directory of teh data folder
lib.baseDir = path.join(__dirname, '/../.data/')

// Write data to a file
lib.create = function(dir, file, data, cb) {
  // Open the file for writing
  const dirPath = `${lib.baseDir}${dir}/${file}.json`

  fs.open(dirPath, 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data)

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, (err) => {
        if (!err) {
          fs.close(fileDescriptor, () => {
            if (!err) {
              cb(false)
            } else {
              cb('Error closing new file')
            }
          })
        } else {
          cb('Error writting to new file')
        }
      })
    } else {
      cb('could not create new file, it may already exist')
    }
  })
}

// Read data from a file
lib.read = function(dir, file, cb) {
  const dirPath = `${lib.baseDir}${dir}/${file}.json`

  fs.readFile(dirPath, 'utf-8', (err, data) => {
    if (!err && data) {
      const parsedData = parseJsonToObject(data)
      cb(false, parsedData)
    } else cb(err, data)
  })
}

// Update data in a file
lib.update = function(dir, file, data, cb) {
  const dirPath = `${lib.baseDir}${dir}/${file}.json`

  fs.open(dirPath, 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data)

      // Truncate the file
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          // Write to the the file and close it
          fs.writeFile(fileDescriptor, stringData, err => {
            if (!err) {
              fs.close(fileDescriptor, err => {
                if (!err) {
                  cb(false)
                } else {
                  cb('Error while closing the file')
                }
              })
            } else {
              cb('Error writing to existing file')
            }
          })
        } else {
          cb('Error truncating file')
        }
      })
    } else {
      cb('Could not open the file for updating, it may not exist yet.')
    }
  })
}

// Delete a file
lib.delete = function(dir, file, cb) {
  // Unlink the file
  const dirPath = `${lib.baseDir}${dir}/${file}.json`

  fs.unlink(dirPath, (err) => {
    if (!err) {
      cb(false)
    } else {
      cb('Error while deleting a file')
    }
  })
}

module.exports = lib
