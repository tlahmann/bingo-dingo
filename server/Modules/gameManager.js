'use strict'

import validator from 'validator'
import p from '../protocol'
import pfui from '../listOfBadWords'

const minNicknameLength = 3
const maxNicknameLength = 22

export default class GameManager {
  constructor () {
    this.users = []
    this.numbers = []
  }

  addUser (user) {
    if (user) {
      this.users.push(user)
    }
  }

  getUserBySocket = (ws) => this.users.filter(u => u.client === ws).reduce(v => v)

  removeSocket (ws) {
    let index = this.users.indexOf(this.getUserBySocket(ws))
    if (index > -1) {
      this.users.splice(index, 1)
    }
  }

  /**
   * Check if a given username is either too long, too short or already taken
   *
   * @param newUser the user that shall be added to the game
   * @returns object
   */
  isValidUsername (newUser) {
    newUser = newUser.trim()
    // Check if the username is alphanumeric characters only
    if (!validator.matches(newUser, '^(([A-Za-zÄÖÜäöü\\d\\-_])+[ ]?)*[A-Za-zÄÖÜäöü\\d\\-_]+$')) {
      return {
        type: p.MESSAGE_NICKNAME_INVALID,
        data: {message: 'Der Benutzername enthält ungültige Zeichen'}
      }
    }
    // Check if the username is too short
    if (newUser.length < minNicknameLength) {
      return {
        type: p.MESSAGE_NICKNAME_INVALID,
        data: {message: 'Der Benutzername ist zu kurz'}
      }
    }
    // check if the username is too long
    if (newUser.length > maxNicknameLength) {
      return {
        type: p.MESSAGE_NICKNAME_INVALID,
        data: {message: 'Der Benutzername ist zu lang'}
      }
    }
    // check if the username is already taken
    if (this.users.filter(u => u.nickname === newUser).length) {
      return {
        type: p.MESSAGE_NICKNAME_INVALID,
        data: {message: 'Der Benutzername wird bereits verwendet'}
      }
    }
    newUser = newUser.toLowerCase().replace(/[0-9]/g, '')
    // check if the username is already taken
    if (pfui.some(w => newUser.indexOf(w) !== -1)) {
      return {
        type: p.MESSAGE_NICKNAME_INVALID,
        data: {message: 'Der Benutzername enthält nicht erlaubte Wörter'}
      }
    }
    // all checks passed: return no error
    return null
  }
}
