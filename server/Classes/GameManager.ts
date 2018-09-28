'use strict'

import * as validator from 'validator'
import { Protocol } from '../protocol'
import pfui from '../listOfBadWords'
import { v4 as uuid } from 'node-uuid'
import { Player } from './Player'
import { GameServer } from './GameServer';

const minNicknameLength = 3
const maxNicknameLength = 22

export class GameManager {
  players: Player[]
  numbers: { id: String, timestamp: number, number: number }[]
  bannedIPs: String[]

  constructor () {
    this.players = []
    this.numbers = []
    this.bannedIPs = []
  }

  addDummyUser(player: Player): void {
    if (!player) return
    this.players.push(player)
  }

  checkPlayerName(player: Player, name: String): boolean {
    let invalidUsername = this.isValidUsername(name)
    if (invalidUsername) {
      let message = {
        id: uuid(),
        timestamp: new Date().getTime(),
        message: invalidUsername
      }
      GameServer.messageHandler.sendPacket(player.client, Protocol.MESSAGE_NICKNAME_INVALID, message)
      return false
    } else {
      GameServer.messageHandler.sendPacket(player.client, Protocol.MESSAGE_NICKNAME_VALID, null)
    }
    return true
  }

  changePlayerName(player: Player, name: String): void {
    if (!this.checkPlayerName(player, name)) return
    GameServer.messageHandler.sendPacket(player.client, Protocol.MESSAGE_NICKNAME_GRANTED, null)
    GameServer.messageHandler.broadcast(
      Protocol.MESSAGE_USER_STATE_CHANGE,
      {
        id: player.id,
        nickname: name,
        role: player.role
      })
  }

  addNumber(num: number) {
    let n = {
      id: uuid(),
      timestamp: new Date().getTime(),
      number: num
    }
    this.numbers.push(n)
    GameServer.messageHandler.broadcast(Protocol.MESSAGE_NUMBER, n)

    // Store the number
    // GameServer.dataBaser.insertNumber(session, n)
    // db.findUser(me.nickname).then(user => {
    // and broadcast it to all players
    // this.broadcast(Protocol.MESSAGE_NUMBER, data.number)
    // }).catch(err => console.log(err))
  }

  setNumbers(numbers) {
    this.numbers = numbers
  }

  getUserBySocket = (ws) => this.players.filter(u => u.client === ws).reduce(v => v)
  getUserByNickname = (nn) => this.players.filter(u => u.nickname === nn).reduce(v => v)
  getUserById = (id) => this.players.filter(u => u.id === id).reduce(v => v)

  removeSocket(ws) {
    let index = this.players.indexOf(this.getUserBySocket(ws))
    if (index > -1) {
      this.players.splice(index, 1)
    }
  }

  checkUser(ip: String) {
    return this.checkUserBanned(ip) || this.checkUserNumConnections(ip)
  }

  checkUserBanned(ip) {
    return this.bannedIPs.indexOf(ip) !== -1 ? 'Der Zugang wurde für dich gesperrt!' : null
  }

  checkUserNumConnections(ip) {
    return this.players.filter(u => u.remoteAddress === ip).length > 3 ? 'Es sind nicht mehr als 3 Verbindungen gleichzeitig erlaubt!' : null
  }

  /**
   * Check if a given username is either too long, too short or already taken
   *
   * @param newUser the user that shall be added to the game
   * @returns object
   */
  isValidUsername(newUser) {
    newUser = newUser.trim()
    // Check if the username is alphanumeric characters only
    if (!validator.matches(newUser, '^(([A-Za-zÄÖÜäöü\\d\\-_])+[ ]?)*[A-Za-zÄÖÜäöü\\d\\-_]+$')) {
      return 'Der Benutzername enthält ungültige Zeichen'
    }
    // Check if the username is too short
    if (newUser.length < minNicknameLength) {
      return 'Der Benutzername ist zu kurz'
    }
    // check if the username is too long
    if (newUser.length > maxNicknameLength) {
      return 'Der Benutzername ist zu lang'
    }
    // check if the username is already taken
    if (this.players.filter(u => u.nickname === newUser).length) {
      return 'Der Benutzername wird bereits verwendet'
    }
    newUser = newUser.toLowerCase().replace(/[0-9]/g, '')
    // check if the username is already taken
    if (pfui.some(w => newUser.indexOf(w) !== -1)) {
      return 'Der Benutzername enthält nicht erlaubte Wörter'
    }
    // all checks passed: return no error
    return null
  }
}
