'use strict'
import MongoClient from 'mongodb'
import hf from '../Modules/HelperFunctions'

export default class DataBaser {
  constructor (url) {
    let that = this

    MongoClient.connect(url, (err, db) => {
      if (err) throw err
      let dbo = that.dbo = db.db('bingo-dingo')
      that.Users = dbo.collection('users')
      that.Boards = dbo.collection('boards')
      that.Numbers = dbo.collection('numbers')
      console.log('# %s: Database connection established. Database: bingo-dingo.', hf.formatDate(new Date()))
      console.log('')
    })
  }

  findUser (nickname) {
    return this.Users.findOne({'nickname': nickname})
      .then((user) => {
        if (user) {
          // user exists, you can throw an error if you want
          return user
          // throw new Error('User already exists!')
        }
        // user doesn't exist, all is good in your case
        return null
      }, function (err) {
        // handle mongoose errors here if needed

        // rethrow an error so the caller knows about it
        // throw new Error('Some Mongoose error happened!')
        throw err
        // or throw err; if you want the caller to know exactly what happened
      })
  }

  authUser (nickname, password) {
    return this.Users.findOne({'nickname': nickname, 'password': password})
      .then((user) => {
        if (user) {
          // user exists, you can throw an error if you want
          console.log('# %s: An admin was authenticated by the database: %s', hf.formatDate(new Date()), nickname)
          return user
          // throw new Error('User already exists!')
        }
        // user doesn't exist, all is good in your case
        return null
      }, function (err) {
        // handle mongoose errors here if needed

        // rethrow an error so the caller knows about it
        // throw new Error('Some Mongoose error happened!')
        throw err
        // or throw err; if you want the caller to know exactly what happened
      })
  }

  insertNewUser (user) {
    let u = {
      nickname: user.nickname,
      role: user.role
    }
    return this.Users.insertOne(u)
      .then(() => { }, (err) => { throw err })
  }

  findBoard (userName, sessionId) {
    return this.Boards.findOne(
      {'nickname': userName, 'session': sessionId}
    ).then(board => board, (err) => { throw err })
  }

  insertNewBoard (user, session) {
    let b = {
      nickname: user.nickname,
      session: session,
      board: user.board
    }
    return this.Boards.insertOne(b)
      .then(() => { }, (err) => { throw err })
  }

  getNumbers (sessionID) {
    return this.Numbers.find({'sessionId': {$eq: sessionID.toString()}}).toArray()
      .then((numbers) => {
        return numbers
      }, function (err) { throw err})
  }

  insertNumber (sessionID, number) {
    return this.Numbers.insertOne({'sessionId': sessionID, number: number})
      .then(() => { }, (err) => { throw err })
  }

  userClick (userNickname, session, number) {
    return this.Boards.update(
      {nickname: userNickname, 'session': session, 'board.number': parseInt(number)},
      {$set: {'board.$.isClicked': true}}
    ).then(() => { }, (err) => { throw err })
  }

  getUsers () {
    return this.Users.find({}, {board: 1, _id: 0}).toArray()
      .then((boards) => {
        return boards
      }, function (err) { throw err })
  }
}
