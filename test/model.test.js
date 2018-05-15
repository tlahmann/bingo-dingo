'use strict'

import 'babel-polyfill'
import { before, describe, it } from 'mocha'
import { expect } from 'chai'

import User from '../server/models/user.model'
import Board from '../server/models/board.model'
import { BingoNumber, BingoSessionNumber } from '../server/models/number.model'

describe('User Model', function () {
  let player
  before(() => {
    player = new User()
  })

  it('should be invalid if name is empty', function (done) {
    player.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.nickname).to.exist
      done()
    })
  })
  it('should be invalid if role is empty', function (done) {
    player.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.role).to.exist
      done()
    })
  })
})

describe('Board Model', function () {
  let board
  before(() => {
    board = new Board()
  })

  it('should be invalid if name is empty', done => {
    board.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.nickname).to.exist
      done()
    })
  })
  it('should be invalid if session is empty', done => {
    board.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.session).to.exist
      done()
    })
  })
  it('should be invalid if board is empty', done => {
    board.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.board).to.exist
      done()
    })
  })
})

describe('Number Model', function () {
  let number
  before(() => {
    number = new BingoNumber()
  })

  it('should be invalid if id is empty', done => {
    number.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.id).to.exist
      done()
    })
  })
  it('should be invalid if timestamp is empty', done => {
    number.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.timestamp).to.exist
      done()
    })
  })
  it('should be invalid if number is empty', done => {
    number.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.number).to.exist
      done()
    })
  })
})

describe('SessionNumber Model', function () {
  let sessionNumber
  before(() => {
    sessionNumber = new BingoSessionNumber()
  })

  it('should be invalid if session is empty', done => {
    sessionNumber.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.session).to.exist
      done()
    })
  })
  it('should be invalid if number is empty', done => {
    sessionNumber.validate(function (err) {
      // noinspection BadExpressionStatementJS
      expect(err.errors.number).to.exist
      done()
    })
  })
})
