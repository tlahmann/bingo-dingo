'use strict'
import uuid from 'node-uuid'
import HelperFunctions from '../Modules/HelperFunctions'

export default class User {
  constructor (ws, ra) {
    this.id = uuid.v4()
    this.client = ws
    this.nickname = null
    this.joinedAt = new Date().getTime()
    this.remoteAddress = ra
    this.role = 'user'
    this.board = HelperFunctions.getRandomGameBoard()
    this.lines = HelperFunctions.getLines()
    this.bingos = 0
  }

  setRole (role) {
    this.role = role
  }

  isAdmin () {
    return this.role === 'admin'
  }

  shouldAuthenticate () {
    return this.role === 'admin' || this.role === 'moderator'
  }
}
