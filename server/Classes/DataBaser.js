'use strict'
import hf from '../Modules/HelperFunctions'
import mongoose from 'mongoose'
import bluebird from 'bluebird'
import UsersService from '../services/users.service'
import BoardsService from '../services/boards.servce'

export default class DataBaser {
  constructor (url, gm, sessionId) {
    let that = this

    mongoose.Promise = bluebird
    mongoose.connect(url + 'bingo-dingo')
      .then(() => {
        /* let dbo = that.dbo = db.db('bingo-dingo')
         that.Users = dbo.collection('users')
         that.Boards = dbo.collection('boards')
         that.Numbers = dbo.collection('numbers')*/
        console.log('# %s: Database connection established. Database: mongodb://127.0.0.1:27017/bingo-dingo.', hf.formatDate(new Date()))
      })
      .catch(() => { console.log('# %s: Error Connecting to the Mongodb Database at URL: mongodb://127.0.0.1:27017/bingo-dingo.', hf.formatDate(new Date()))})
  }

  static async findUser (nickname, password) {
    const query = {nickname: nickname}
    if (password) {
      query.password = password
    }
    return await UsersService.getUsers(query, 1, 1)
  }

  static async insertNewUser (user) {
    return await UsersService.createUser(user)
  }

  static async findBoard (userName, sessionId) {
    return await BoardsService.getBoards({nickname: userName, session: sessionId}, 1, 1)
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
