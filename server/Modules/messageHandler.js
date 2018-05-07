'use strict'

import p from '../protocol'
import hf from './HelperFunctions'

export default class MessageHandler {
  constructor (gameManager, dataBaser) {
    this.gm = gameManager
    this.db = dataBaser
  }

  sendPacket (ws, type, data) {
    let output

    try {
      output = JSON.stringify({
        type: type,
        data: data
      })
    } catch (err) {
      console.log('# %s: Failed to encode packet: %s', hf.formatDate(new Date()), err.message)
    }

    try {
      ws.send(output)
    } catch (err) {
      // console.log('# %s: Failed to send packet: %s', hf.formatDate(new Date()), err.message)
    }
  }

  selectiveBroadcast (fn, type, msg) {
    this.gm.users
      .filter(u => fn(u))
      .map(user => this.sendPacket(user.client, type, msg))
  }

  broadcast (type, data) {
    this.selectiveBroadcast(() => true, type, data)
  }

  sendUserList (ws) {
    let output = this.gm.users
      .map(u => {
        return {
          id: u.id,
          nickname: u.nickname,
          role: u.role
        }
      })
    this.sendPacket(ws, p.MESSAGE_USER_LIST, output)
  }

  sendHistory (ws, sessionId) {
    this.db.getNumbers(sessionId).then(numbers => {
      let output = numbers
        .map(n => {
          return {
            id: n.number.id,
            timestamp: n.number.timestamp,
            number: n.number.number
          }
        })
      this.gm.setNumbers(output)
      this.sendPacket(ws, p.MESSAGE_HISTORY, output)
    }).catch(err => {})
  }

  sendStats () {
    let stats = {}
    stats['usersOnline'] = this.gm.users.length
    stats['numbersDrawn'] = this.gm.numbers.length
    stats['completion'] = this.gm.users.reduce((s, u) => s + u.board.filter(b => b.isClicked).length, 0)
    stats['misses'] = this.gm.users
      .reduce((s, u) =>
        s + u.board.filter(f =>
        !f.isClicked &&
        this.gm.numbers.some(n =>
          n.number == f.number
        )).length,
        0)
    stats['bingos'] = this.gm.users.reduce((s, u) => s + u.bingos, 0)
    // TODO: get number of plyers that need one, two, three. etc for a bingo
    stats['oneToGo'] = this.gm.users
      .reduce((s, u) =>
        s + (hf.countMissing(u.board, u.lines, 4) || 0),
        0)
    stats['twoToGo'] = this.gm.users
      .reduce((s, u) =>
        s + (hf.countMissing(u.board, u.lines, 3) || 0),
        0)
    let nums = new Array(75).fill(0)
    this.gm.users.forEach(u => {
      u.board.forEach(n => {
        if (n.number != 'FREE')
          nums[n.number]++
      })
    })
    stats['common'] = hf.findCommon(nums, this.gm.numbers)
    stats['bingosPlayers'] = this.gm.users.filter(u => u.bingos > 0).map(u => {
      return {id: u.id, nickname: u.nickname}
    })
    this.broadcast(p.MESSAGE_STATS, stats)
  }
}
