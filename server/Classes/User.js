'use strict'
import uuid from 'node-uuid'
import HelperFunctions from '../Modules/HelperFunctions'

export default class User {
  constructor (ws) {
    this.id = uuid.v4()
    this.client = ws
    this.nickname = null
    this.joinedAt = new Date().getTime()
    this.isAdmin = false
    this.board = HelperFunctions.getRandomGameBoard()
    this.lines = HelperFunctions.getLines()
    this.bingos = 0
  }

  setAdmin () {
    this.isAdmin = true
  }
}
