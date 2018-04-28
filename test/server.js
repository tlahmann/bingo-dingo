'use strict'

import WebSocket from 'ws'

import { before, describe, it } from 'mocha'
import { expect } from 'chai'

import assert from 'assert'

import User from '../server/Classes/User'
import p from '../server/protocol'

describe('User', () => {
  let player1
  before(() => {
    player1 = new User()
  })

  it('should not be admin', () => {
    expect(player1.isAdmin).to.be.false
  })

  it('should have a gameboard', () => {
    expect(player1.board).to.have.lengthOf(25)
  })

  it('gameboard should have a free field', () => {
    expect(player1.board).to.deep.include({number: 'FREE', isClicked: true})
  })
})

describe('Admin', () => {
  it('should be admin', () => {
    let player1 = new User()
    player1.setAdmin()
    expect(player1.isAdmin).to.be.true
  })
})

describe('protocol', () => {
  let player1, player2
  before(() => {
    player1 = new WebSocket('ws://localhost:8021')
    player2 = new WebSocket('ws://localhost:8021')
  })

  it('player1 is asked for identity', (done) => {
    player1.once('message', (message) => {
      expect(message).equal(JSON.stringify({
        type: p.MESSAGE_WHO_ARE_YOU,
        data: null
      }))
      done()
    })
    player1.once('connect', () => { })
  })

  it('player2 is asked for identity', (done) => {
    player2.once('message', (message) => {
      expect(message).equal(JSON.stringify({
        type: p.MESSAGE_WHO_ARE_YOU,
        data: null
      }))
      done()
    })
    player2.once('connect', () => { })
  })

  it('player1 nickname is rejected (invalid)', (done) => {
    player1.once('message', (message) => {
      expect(message).equal(JSON.stringify({
        type: p.MESSAGE_NAME_BAD_CHARACTERS,
        data: null
      }))
      done()
    })
    player1.send(JSON.stringify({
      type: p.MESSAGE_REQUEST_NICKNAME,
      data: {nickname: 'Peter|/(&%!"!'}
    }))
  })

  it('player1 nickname is rejected (too short)', (done) => {
    player1.once('message', (message) => {
      expect(message).equal(JSON.stringify({
        type: p.MESSAGE_NAME_TOO_SHORT,
        data: null
      }))
      done()
    })
    player1.send(JSON.stringify({
      type: p.MESSAGE_REQUEST_NICKNAME,
      data: {nickname: 'Pe'}
    }))
  })

  it('player1 nickname is rejected (too long)', (done) => {
    player1.once('message', (message) => {
      expect(message).equal(JSON.stringify({
        type: p.MESSAGE_NAME_TOO_LONG,
        data: null
      }))
      done()
    })
    player1.send(JSON.stringify({
      type: p.MESSAGE_REQUEST_NICKNAME,
      data: {nickname: 'PeterMaierDerGrosseImFeldeDerVielenSteine'}
    }))
  })

  it('player1 nickname is accepted', (done) => {
    player1.once('message', (message) => {
      expect(message).equal(JSON.stringify({
        type: p.MESSAGE_NICKNAME_GRANTED,
        data: null
      }))
      done()
    })
    player1.send(JSON.stringify({
      type: p.MESSAGE_REQUEST_NICKNAME,
      data: {nickname: 'Peter'}
    }))
  })

  it('player2 is informed', (done) => {
    player2.once('message', (message) => {
      expect(message.type).equal(p.MESSAGE_USER_STATE_CHANGE)
      done()
    })
    // player2.send(JSON.stringify({
    //   type: p.MESSAGE_REQUEST_NICKNAME,
    //   data: {nickname: 'Peter'}
    // }))
  })

  it('player2 nickname is rejected (in use)', (done) => {
    player2.once('message', (message) => {
      expect(message).equal(JSON.stringify({
        type: p.MESSAGE_NAME_IN_USE,
        data: null
      }))
      done()
    })
    player2.send(JSON.stringify({
      type: p.MESSAGE_REQUEST_NICKNAME,
      data: {nickname: 'Peter'}
    }))
  })

})
