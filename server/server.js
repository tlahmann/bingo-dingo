'use strict'

// Imports
import DataBaser from './Classes/DataBaser'
import GameManager from './Modules/gameManager'
import MessageHandler from './Modules/messageHandler'
import User from './Classes/User'
import WebSocket from 'ws'
import p from './protocol'
import hf from './Modules/HelperFunctions'
import { appendLine, getLastLine } from './Modules/fileTools'
import uuid from 'node-uuid'
import path from 'path'

// Parameters
const wsPort = 8021
const dataBaseURL = 'mongodb://localhost:27017/'
const fileName = path.join(__dirname, 'session.txt')
const wss = new WebSocket.Server({port: wsPort})
let session = ''
let bannedIPs = []

/// STARTUP routine

wss.on('listening', function () {
  console.log('##########')
  console.log('# %s: Server is listening on port %d.', hf.formatDate(new Date()), wsPort)

  getLastLine(fileName, 1)
    .then((lastLine) => {
      console.log('# %s: Server started with an existing session: %s', hf.formatDate(new Date()), lastLine)
      console.log('')
      session = lastLine
    })
    .catch((err) => {
      console.error(err)
    })
})

const gm = new GameManager()
const db = new DataBaser(dataBaseURL)
const mh = new MessageHandler(gm, db)

/// WebSocket Server

wss.on('connection', (ws, req) => {
  /***
   * If a user connects and is not a returning user he or she gets a random uuid assigned. The nickname is unset at first
   * @type {User}
   */
  let me = new User(ws, req.connection.remoteAddress)
  gm.addUser(me)
  if (bannedIPs.indexOf(req.connection.remoteAddress) !== -1) {
    mh.sendPacket(ws, p.MESSAGE_SERVER_REJECT, {
      id: uuid.v4(),
      timestamp: new Date().getTime(),
      message: 'Der Zugang wurde für dich gesperrt!'
    })
    ws.close()
  } else if (gm.users.filter(u => u.remoteAddress === req.connection.remoteAddress).length > 3) {
    mh.sendPacket(ws, p.MESSAGE_SERVER_REJECT, {
      id: uuid.v4(),
      timestamp: new Date().getTime(),
      message: 'Es sind nicht mehr als 3 Verbindungen gleichzeitig erlaubt!'
    })
    ws.close()
  }

  /***
   * Initially the user is asked for authentication
   */
  mh.sendPacket(ws, p.MESSAGE_WHO_ARE_YOU, null)

  mh.broadcast(
    p.MESSAGE_USER_JOINS,
    {
      id: me.id,
      nickname: me.nickname,
      joinedAt: me.joinedAt
    })
  mh.sendUserList(ws)
  mh.sendHistory(ws, session)

  ws.on('close', () => {
    mh.broadcast(p.MESSAGE_USER_LEAVES, {id: me.id})
    gm.removeSocket(ws)
  })

  ws.on('message', (m) => {
    let decoded = ''
    try {
      decoded = JSON.parse(m)
      if (m.nickname) {
        console.log('# %s: A message was received from %s. The message was: %s',
          hf.formatDate(new Date()),
          me.nickname,
          decoded.data.message)
      }

      for (let key in decoded.data) {
        if (decoded.data.hasOwnProperty(key)) {
          decoded.data[key] = hf.sanitize(decoded.data[key])
        }
      }
    }
    catch (e) {
      console.log('# %s: An exception has been caught parsing a message from %s. The exception was: %s', hf.formatDate(new Date()), gm.getUserBySocket(ws).nickname, e)
    }

    if (decoded.type === p.MESSAGE_CHECK_NICKNAME) {
      let err = gm.isValidUsername(decoded.data.nickname)
      if (err) {
        mh.sendPacket(ws, err.type, err.data)
        return
      }

      mh.sendPacket(ws, p.MESSAGE_NICKNAME_VALID, null)
    }

    if (decoded.type === p.MESSAGE_REQUEST_NICKNAME) {
      let err = gm.isValidUsername(decoded.data.nickname)
      if (err) {
        mh.sendPacket(ws, err.type, err.data)
        return
      }

      // Set the username for this user
      me.nickname = decoded.data.nickname

      let shouldAuthenticate = false
      // See if we can find a user in the database
      DataBaser.findUser(decoded.data.nickname)
        .then(results => {
          if (results.docs.length !== 0) {
            let user = results.docs[0]
            me.nickname = user.nickname
            if (user.password || me.shouldAuthenticate()) throw new AuthenticationError()
            console.log('# %s: A returning player was fetched from the database: %s', hf.formatDate(new Date()), decoded.data.nickname)
          } else {
            db.insertNewUser(me, session).then(() => {
              console.log('# %s: A new player was added to the database: %s', hf.formatDate(new Date()), decoded.data.nickname)
            }).catch(err => console.log(err))
          }
        })
        .then(() => {
          mh.broadcast(
            p.MESSAGE_USER_STATE_CHANGE,
            {
              id: me.id,
              nickname: decoded.data.nickname,
              role: me.role
            })
        })
        .then(() => DataBaser.findBoard(me.nickname, session))
        .then(results => {
          console.log(results)
          if (results.docs.length !== 0) {
            let board = results.docs[0]
            me.board = board.board
            me.bingos = hf.countBingos(me.board, me.lines)
            me.lines = hf.clearLines(me.board, me.lines)
          } else {
            db.insertNewBoard(me, session).then(() => {
            }).catch(err => console.log(err))
          }
          if (!shouldAuthenticate) {
            mh.sendPacket(ws, p.MESSAGE_USER_BOARD, {board: me.board})
          }
        })
        .catch(function (err) {
          if (err instanceof AuthenticationError) {
            mh.sendPacket(ws, p.MESSAGE_AUTHENTICATE, null)
          } else {
            console.log('# %s: A mongo error occured: %s', hf.formatDate(new Date()), err.message)
          }
        })
    }

    if (decoded.type === p.MESSAGE_NUMBER) {
      if (!decoded.message.length || !me.nickname) {
        return
      }
      DataBaser.findUser(me.nickname).then(user => {
        if (user && user.role === 'admin') {
          let n = {
            id: uuid.v4(),
            timestamp: new Date().getTime(),
            number: hf.sanitize(decoded.message)
          }

          // Store the number
          db.insertNumber(session, n)
          gm.numbers.push(n)

          // and broadcast it to all players
          mh.broadcast(p.MESSAGE_NUMBER, n)
        }
      }).catch(err => console.log(err))
      return
    }

    if (decoded.type === p.MESSAGE_SERVER_MESSAGE) {
      if (!decoded.message.length || !me.nickname) {
        return
      }
      DataBaser.findUser(me.nickname).then(user => {
        if (user && user.role === 'admin') {
          mh.broadcast(p.MESSAGE_SERVER_MESSAGE, {
            id: uuid.v4(),
            timestamp: new Date().getTime(),
            message: hf.sanitize(decoded.message)
          })
        }
      }).catch(err => console.log(err))
      return
    }

    if (decoded.type === p.MESSAGE_CLICK) {
      db.userClick(me.nickname, session, decoded.data.number)
      let indx = me.board.findIndex(f => f.number === parseInt(decoded.data.number))
      me.board[indx].isClicked = true
      let ll = me.lines.length
      me.lines = hf.calculateWinner(me.board, me.lines)
      if (ll !== me.lines.length) {
        me.bingos++
        mh.broadcast(p.MESSAGE_SERVER_MESSAGE, {
          id: uuid.v4(),
          timestamp: new Date().getTime(),
          from: me.nickname,
          message: me.nickname + ' hat ein Bingo erreicht!'
        })
      }
      return
    }

    if (decoded.type === p.MESSAGE_GAME_RESET) {
      // console.log('Game reset send, ignoring...')
      DataBaser.findUser(me.nickname).then(user => {
        if (user && user.role === 'admin') {
          session = uuid.v4()
          appendLine(fileName, session)

          for (const client of wss.clients) {
            mh.sendPacket(client, p.MESSAGE_SERVER_MESSAGE, {
              id: uuid.v4(),
              timestamp: new Date().getTime(),
              from: me.nickname,
              message: 'Ein neues Spiel wurde gestartet! Bitte das Fenster neu laden.'
            })
            client.close()
          }
          gm.numbers = []
        }
      }).catch(err => console.log(err))
    }

    if (decoded.type === p.MESSAGE_AUTHENTICATE) {
      DataBaser.findUser(decoded.data.nickname, decoded.data.password).then((user) => {
        if (user) {
          gm.getUserBySocket(ws).nickname = user.nickname
          me.setRole(user.role)

          mh.sendPacket(ws, p.MESSAGE_NICKNAME_GRANTED, null)
          mh.sendPacket(ws, p.MESSAGE_USER_BOARD, {board: me.board})
          mh.sendPacket(ws, p.MESSAGE_AUTHENTICATED, {role: me.role})

          mh.broadcast(
            p.MESSAGE_USER_STATE_CHANGE,
            {
              id: me.id,
              nickname: decoded.data.nickname,
              role: me.role
            })
        }
      }).catch(err => console.log(err))
    }

    if (decoded.type === p.MESSAGE_USER_KICK) {
      if (!decoded.data.userId.length || !me.nickname) {
        return
      }
      DataBaser.findUser(me.nickname).then(user => {
        if (user && (user.role === 'admin' || user.role === 'moderator')) {
          let kickedUser = gm.getUserById(decoded.data.userId)
          kickedUser.client.close()
          console.log('# %s: Player %s was kicked by user %s', hf.formatDate(new Date()), kickedUser.nickname, me.nickname)
        }
      }).catch(err => console.log(err))
    }

    if (decoded.type === p.MESSAGE_USER_BAN) {
      if (!decoded.data.userId.length || !me.nickname) {
        return
      }
      DataBaser.findUser(me.nickname).then(user => {
        if (user && (user.role === 'admin' || user.role === 'moderator')) {
          let bannedUser = gm.getUserById(decoded.data.userId)
          bannedUser.client.close()
          bannedIPs.push(bannedUser.remoteAddress)
          console.log('# %s: Player %s was banned by user %s', hf.formatDate(new Date()), bannedUser.nickname, me.nickname)
        }
      }).catch(err => console.log(err))
    }
  })
})

export class AuthenticationError extends Error {
  constructor () {
    super() // (1)
    this.name = 'AuthenticationError' // (2)
  }
}

setInterval(function stats () {
  wss.clients.forEach(function each (ws) {
    mh.sendStats(ws)
  })
}, 10000)
