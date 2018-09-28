'use strict'

// Imports
import * as WebSocket from 'ws'
import * as p from './protocol'
import { HelperFunctions } from './Modules/HelperFunctions'
import { appendLine, getLastLine } from './Modules/fileTools'
import * as uuid from 'node-uuid'
import { GameServer } from './Classes/GameServer';
import { Player } from './Classes/Player';

// Parameters
const wsPort: number = Number(process.env.PORT || 8021)
const wss = new WebSocket.Server({ port: wsPort })

const gameServer = new GameServer()

/// WebSocket Server
wss.on('listening', () => {
  console.log('##########')
  console.log(`# ${ HelperFunctions.formatDate(new Date()) }: Server is listening on port ${ wsPort }.`)

  gameServer.loadSession()
})

wss.on('connection', (ws, req) => {
  /***
   * If a user connects and is not a returning user he or she gets a random uuid assigned. The nickname is unset at first
   */
  let ip = (req.headers['x-forwarded-for'] as String || '').split(',').pop() ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress
  let me: Player = new Player(ws, ip)
  gameServer.addPlayer(me)
  gameServer.checkPlayer(me, ip)

  ws.on('close', () => {
    gameServer.removePlayer(me);
  })

  ws.on('message', (m) => {
    GameServer.messageHandler.handle(me, m)

    /* if (decoded.type === p.MESSAGE_SERVER_MESSAGE) {
      if (!decoded.message.length || !me.nickname) {
        return
      }
      db.findUser(me.nickname).then(user => {
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
      db.findUser(me.nickname).then(user => {
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
      db.authUser(decoded.data.nickname, decoded.data.password).then((user) => {
        if (user) {
          gm.getUserBySocket(ws).nickname = user.nickname
          me.setRole(user.role)

          mh.sendPacket(ws, p.MESSAGE_NICKNAME_GRANTED, null)
          mh.sendPacket(ws, p.MESSAGE_USER_BOARD, { board: me.board })
          mh.sendPacket(ws, p.MESSAGE_AUTHENTICATED, { role: me.role })

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
      db.findUser(me.nickname).then(user => {
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
      db.findUser(me.nickname).then(user => {
        if (user && (user.role === 'admin' || user.role === 'moderator')) {
          let bannedUser = gm.getUserById(decoded.data.userId)
          bannedUser.client.close()
          gm.bannedIPs.push(bannedUser.remoteAddress)
          console.log('# %s: Player %s with ip %s was banned by user %s',
            hf.formatDate(new Date()),
            bannedUser.nickname,
            bannedUser.remoteAddress.toString(),
            me.nickname)
        }
      }).catch(err => console.log(err))
    } */
  })
})

setInterval(function stats() {
  GameServer.messageHandler.sendStats()
}, 10000)
