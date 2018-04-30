'use strict'

import validator from 'validator'
import p from '../protocol'
import hf from '../Modules/HelperFunctions'

const minNicknameLength = 3
const maxNicknameLength = 22

export default class GameManager {
  constructor () {
    this.users = []
    this.numbers = []
    this.numBingos = 0
  }

  addUser (user) {
    if (user) {
      this.users.push(user)
    }
  }

  getUserBySocket = (ws) => this.users.filter(u => u.client === ws).reduce(v => v, [])

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
    if (!validator.matches(newUser, '^(([A-Za-z\\d\\-_])+[ ]?)*[A-Za-z\\d\\-_]+$')) {
      return {
        type: p.MESSAGE_NAME_BAD_CHARACTERS,
        data: null
      }
    }
    // Check if the username is too short
    if (newUser.length < minNicknameLength) {
      return {
        type: p.MESSAGE_NAME_TOO_SHORT,
        data: null
      }
    }
    // check if the username is too long
    if (newUser.length > maxNicknameLength) {
      return {
        type: p.MESSAGE_NAME_TOO_LONG,
        data: null
      }
    }
    // check if the username is already taken
    if (this.users.filter(u => u.nickname === newUser).length) {
      return {
        type: p.MESSAGE_NAME_IN_USE,
        data: null
      }
    }
    // all checks passed: return no error
    return null
  }
}
