'use strict'

/***
 * User service
 * @author Tobias Lahmann
 * on 07.05.2018
 */

// Getting the BUser mongoose Model
import BUser from '../models/user.model'

// Async function to get the user List
exports.getUsers = async function (query, page, limit) {
  // Options setup for the mongoose paginate
  let options = {
    page,
    limit
  }

  // Try Catch the awaited promise to handle the error
  try {
    // Return the user list that was retured by the mongoose promise
    return await BUser.paginate(query, options)
  } catch (e) {
    // return a Error message describing the reason
    throw Error('Error occurred while Paginating Users')
  }
}

exports.createUser = async function (user) {
  console.log(user)
  // Creating a new Mongoose Object by using the new keyword
  let newUser = new BUser({
    nickname: user.nickname,
    role: user.role,
    password: user.password
  })

  try {
    // Saving the BUser
    return await newUser.save()
  } catch (e) {
    // return a Error message describing the reason
    throw Error('Error occurred while Creating BUser')
  }
}

// TODO login not implemented
exports.updateUser = async function (user) {
  let oldUser
  let id = user.id

  try {
    //Find the old BUser Object by the Id
    oldUser = await BUser.findById(id)
  } catch (e) {
    throw Error('Error occurred while Finding the BUser')
  }

  // If no old BUser Object exists return false
  if (!oldUser) {
    return false
  }

  console.log(oldUser)

  //Edit the BUser Object
  oldUser.title = user.title
  oldUser.description = user.description
  oldUser.status = user.status

  console.log(oldUser)

  try {
    return await oldUser.save()
  } catch (e) {
    throw Error('And Error occurred while updating the BUser')
  }
}
