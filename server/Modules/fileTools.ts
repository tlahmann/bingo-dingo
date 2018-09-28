'use strict'

// fileTools.js
import * as fs from 'fs'
import * as readLine from 'readline'
import * as Stream from 'stream'

export function getLastLine(fileName: fs.PathLike, minLength: number): Promise<String> {
  let inStream = fs.createReadStream(fileName)
  return new Promise((resolve, reject) => {
    let rl = readLine.createInterface(inStream)

    let lastLine: String = ''
    rl.on('line', function (line) {
      if (line.length >= minLength) {
        lastLine = String(line)
      }
    })

    rl.on('error', reject)

    rl.on('close', function () {
      resolve(lastLine)
    })
  })
}

export function appendLine(fileName, data) {
  fs.appendFile(fileName, '\n' + data, 'utf8', function (err) {
    if (err) throw err
    console.log('Not Saved!')
  })
}
