'use strict'

// fileTools.js
import fs from 'fs'
import readLine from 'readline'
import Stream from 'stream'

exports.getLastLine = (fileName, minLength) => {
  let inStream = fs.createReadStream(fileName)
  let outStream = new Stream
  return new Promise((resolve, reject) => {
    let rl = readLine.createInterface(inStream, outStream)

    let lastLine = ''
    rl.on('line', function (line) {
      if (line.length >= minLength) {
        lastLine = line
      }
    })

    rl.on('error', reject)

    rl.on('close', function () {
      resolve(lastLine)
    })
  })
}

exports.appendLine = (fileName, data) => {
  fs.appendFile(fileName, '\n' + data, 'utf8', function (err) {
    if (err) throw err
    console.log('Saved!')
  })
}
