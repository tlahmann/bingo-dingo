'use strict'

import WebSocket from 'ws'
import protocol from './protocol'

// Parameters
const wsPort = 8021
const wss = new WebSocket.Server({port: wsPort})

wss.on('listening', function () {
  console.log('##########')
  console.log('# %s: Server is listening on port %d.', hf.formatDate(new Date()), wsPort)
})
