'use strict'

// Imports
import DataBaser from './Classes/DataBaser'
import GameManager from './Modules/gameManager'
import MessageHandler from './Modules/messageHandler'
import User from './Classes/User'
import WebSocket from 'ws'
import p from './protocol'
import hf from './Modules/HelperFunctions'
import { getLastLine, appendLine } from './Modules/fileTools'
import uuid from 'node-uuid'
import path from 'path'

// Parameters
const wsPort = 8021
const dataBaseURL = 'mongodb://localhost:27017/'
const wss = new WebSocket.Server({port: wsPort})
let session = ''
const fileName = path.join(__dirname, 'session.txt')

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

const db = new DataBaser(dataBaseURL)
const gm = new GameManager(db)
const mh = new MessageHandler(gm, db)

/// WebSocket Server

wss.on('connection', (ws) => {
  /***
   * If a user connects and is not a returning user he or she gets a random uuid assigned. The nickname is unset at first
   * @type {User}
   */
  let me = new User(ws)
  gm.addUser(me)

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
        mh.sendPacket(ws, err.type, null)
        return
      }

      mh.sendPacket(ws, p.MESSAGE_NICKNAME_VALID, null)
    }

    if (decoded.type === p.MESSAGE_REQUEST_NICKNAME) {
      let err = gm.isValidUsername(decoded.data.nickname)
      if (err) {
        mh.sendPacket(ws, err.type, null)
        return
      }

      // Set the username for this user
      me.nickname = decoded.data.nickname

      let shouldAuthenticate = false
      // See if we can find a user in the database
      db.findUser(decoded.data.nickname).then((user) => {
        if (user) {
          me.nickname = user.nickname
          console.log(user.role)
          me.isAdmin = user.role === 'admin'
          shouldAuthenticate = user.password || false
          console.log('# %s: A returning player was fetched from the database: %s', hf.formatDate(new Date()), decoded.data.nickname)
        } else {
          db.insertNewUser(me, session).then(() => {
            console.log('# %s: A new player was added to the database: %s', hf.formatDate(new Date()), decoded.data.nickname)
          }).catch(err => console.log(err))
        }

        if (shouldAuthenticate) {
          mh.sendPacket(ws, p.MESSAGE_AUTHENTICATE, null)
        }
        else {
          mh.sendPacket(ws, p.MESSAGE_NICKNAME_GRANTED, null)
        }

        mh.broadcast(
          p.MESSAGE_USER_STATE_CHANGE,
          {
            id: me.id,
            nickname: decoded.data.nickname,
            isAdmin: me.isAdmin
          })

        mh.sendStats(ws)
      }).catch(function (err) {
        console.log('# %s: A mongo error occured: %s', hf.formatDate(new Date()), err.message)
      }).then(
        db.findBoard(me.nickname, session).then(board => {
          if (board) {
            me.board = board.board
            me.bingos = hf.countBingos(me.board, me.lines)
            me.lines = hf.clearLines(me.board, me.lines)
            console.log('# %s: The player got an existing board.', hf.formatDate(new Date()))
          } else {
            db.insertNewBoard(me, session).then(() => {
              console.log('# %s: A new board was added to the database.', hf.formatDate(new Date()))
            }).catch(err => console.log(err))
          }
          if (!shouldAuthenticate) {
            mh.sendPacket(ws, p.MESSAGE_USER_BOARD, {board: me.board})
          }
        })).catch(function (err) {
        console.log('# %s: A mongo error occured: %s', hf.formatDate(new Date()), err.message)
      })
    }

    if (decoded.type === p.MESSAGE_NUMBER) {
      if (!decoded.message.length || !me.nickname) {
        return
      }
      db.findUser(me.nickname).then(user => {
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
          mh.sendStats()
        }
      }).catch(err => console.log(err))
      return
    }

    if (decoded.type === p.MESSAGE_WINNER) {
      gm.getUserBySocket(ws).bingos++
      mh.broadcast(p.MESSAGE_SERVER_MESSAGE, {
        id: uuid.v4(),
        timestamp: new Date().getTime(),
        from: me.nickname,
        message: me.nickname + ' hat ein Bingo erreicht!'
      })
      mh.sendStats()
      return
    }

    if (decoded.type === p.MESSAGE_CLICK) {
      db.userClick(me.nickname, session, decoded.data.number)
      let indx = me.board.findIndex(f => f.number === parseInt(decoded.data.number))
      me.board[indx].isClicked = true
      mh.sendStats()
      return
    }

    if (decoded.type === p.MESSAGE_GAME_RESET) {
      // console.log('Game reset send, ignoring...')
      db.findUser(me.nickname).then(user => {
        if (user && user.isAdmin) {
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
      db.authUser(decoded.data.nickname, decoded.data.password).then((user) => {
        if (user) {
          gm.getUserBySocket(ws).nickname = user.nickname
          gm.getUserBySocket(ws).isAdmin = user.isAdmin

          mh.sendPacket(ws, p.MESSAGE_NICKNAME_GRANTED, null)
          mh.sendPacket(ws, p.MESSAGE_USER_BOARD, {board: me.board})
          mh.sendPacket(ws, p.MESSAGE_HELLO, {isAdmin: true})

          mh.broadcast(
            p.MESSAGE_USER_STATE_CHANGE,
            {
              id: me.id,
              nickname: decoded.data.nickname,
              isAdmin: me.isAdmin
            })
        }
      }).catch(err => console.log(err))
    }
  })
})

setInterval(function stats () {
  wss.clients.forEach(function each (ws) {
    mh.sendStats(ws)
  })
}, 10000)
