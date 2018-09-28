'use strict'

import { Protocol } from '../Protocol'
import { GameServer } from './GameServer'
import { Player } from './Player'
import { PlayerRoles } from './PlayerRoles'
import { HelperFunctions } from '../Modules/HelperFunctions'

export class MessageHandler {
  constructor () {
  }

  handle(player: Player, message): void {
    message = this.decode(message)
    if (!message.data) return;
    let data: any
    switch (message.type) {
      case Protocol.MESSAGE_CLICK:
        this.handleClick(player, message.data);
        break;
      case Protocol.MESSAGE_NUMBER:
        if (!this.isAuthorized(player)) break;
        data = message.data.number
        GameServer.gameManager.addNumber(data)
        break;
      case Protocol.MESSAGE_CHECK_NICKNAME:
        data = message.data.nickname
        GameServer.gameManager.checkPlayerName
          (player, data)
        break;
      case Protocol.MESSAGE_REQUEST_NICKNAME:
        data = message.data.nickname
        GameServer.gameManager.changePlayerName(player, data)
        break;
      default:
        console.log('default operation:', message);
        break;
    }
  }

  decode(message): JSON {
    let decoded
    try {
      decoded = JSON.parse(message)
      for (let key in decoded.data) {
        if (decoded.data.hasOwnProperty(key)) {
          decoded.data[key] = HelperFunctions.sanitize(decoded.data[key])
        }
      }
    }
    catch (e) {
      console.log(`# ${ HelperFunctions.formatDate(new Date()) }: An exception has been caught parsing a message. The exception was: ${ e }`)
    }
    return decoded
  }

  isAuthorized(player): boolean {
    if (!player) return false
    if (player.role !== PlayerRoles.Admin) return false
    return true
  }

  handleClick(player: Player, data): void {
    // this.room.state.clickPlayer(client.sessionId, data.number)
  }

  sendPacket(ws, type, data) {
    let output

    try {
      output = JSON.stringify({
        type: type,
        data: data
      })
    } catch (err) {
      console.log(`# ${ HelperFunctions.formatDate(new Date()) }: Failed to encode packet: ${ err.message }.`)
    }

    try {
      ws.send(output)
    } catch (err) {
      // console.log('# %s: Failed to send packet: %s', HelperFunctions.formatDate(new Date()), err.message)
    }
  }

  selectiveBroadcast(fn, type, msg) {
    GameServer.gameManager.players
      .filter(u => fn(u))
      .map(user => this.sendPacket(user.client, type, msg))
  }

  broadcast(type, data): void {
    this.selectiveBroadcast(() => true, type, data)
  }

  sendUserList(ws) {
    let output = GameServer.gameManager.players
      .map(u => {
        return {
          id: u.id,
          nickname: u.nickname,
          role: u.role
        }
      })
    this.sendPacket(ws, Protocol.MESSAGE_USER_LIST, output)
  }

  sendHistory(ws, sessionId) {
    /* this.db.getNumbers(sessionId).then(numbers => {
      let output = numbers
        .map(n => {
          return {
            id: n.number.id,
            timestamp: n.number.timestamp,
            number: n.number.number
          }
        })
      GameServer.gameManager.setNumbers(output)
      this.sendPacket(ws, Protocol.MESSAGE_HISTORY, output)
    }).catch(err => {}) */
  }

  sendStats() {
    let stats = {}
    let users = GameServer.gameManager.players.filter(u => u.nickname)
    stats['usersOnline'] = users.length
    stats['numbersDrawn'] = GameServer.gameManager.numbers.length
    stats['completion'] = users.reduce((s, u) => s + u.board.filter(b => b.isClicked).length, 0)
    stats['misses'] = users
      .reduce((s, u) =>
        s + u.board.filter(f =>
          !f.isClicked &&
          GameServer.gameManager.numbers.some(n =>
            (new Date).getTime() - +n.timestamp < 2 * 60 * 60 * 1000 &&
            +n.number === +f.number
          )).length,
        0)
    stats['bingos'] = users.reduce((s, u) => s + u.bingos, 0)
    stats['oneToGo'] = users
      .reduce((s, u) => s + (HelperFunctions.countMissing(u.board, u.lines, 4) || 0),
        0)
    stats['twoToGo'] = users
      .reduce((s, u) =>
        s + (HelperFunctions.countMissing(u.board, u.lines, 3) || 0),
        0) - stats['oneToGo']
    let nums = new Array(75).fill(0)
    users.forEach(u => {
      u.board.forEach(n => {
        if (n.number !== -1)
          nums[n.number]++
      })
      let importantNumbers = HelperFunctions.getMissing(u.board, u.lines, 4)
      importantNumbers.forEach(n => { if (n) nums[n] += 2 })
    })
    stats['common'] = HelperFunctions.findCommon(nums, GameServer.gameManager.numbers)
    stats['bingosPlayers'] = users.filter(u => u.bingos > 0).map(u => {
      return { id: u.id, nickname: u.nickname }
    })
    this.broadcast(Protocol.MESSAGE_STATS, stats)
  }

}
