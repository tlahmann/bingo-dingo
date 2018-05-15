'use strict'

/***
 * Boards service
 * @author Tobias Lahmann
 * on 09.05.2018
 */

// Getting the BUser mongoose Model
import BBoard from '../models/board.model'

// Async function to get the user List
exports.getBoards = async function (query, page, limit) {
  // Options setup for the mongoose paginate
  let options = {
    page,
    limit
  }

  // Try Catch the awaited promise to handle the error
  try {
    // Return the user list that was retured by the mongoose promise
    return await BBoard.paginate(query, options)
  } catch (e) {
    // return a Error message describing the reason
    throw Error('Error occurred while paginating board')
  }
}

exports.createBoard = async function (board) {
  // Creating a new Mongoose Object by using the new keyword
  let newBoard = new BBoard({
    nickname: board.nickname,
    session: board.session,
    board: board.board
  })

  try {
    // Saving the BUser
    return await newBoard.save()
  } catch (e) {
    // return a Error message describing the reason
    throw Error('Error occurred while creating board')
  }
}