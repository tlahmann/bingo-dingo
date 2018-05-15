'use strict'

/***
 * Users controller
 * @author Tobias Lahmann
 * on 07.05.2018
 */

// Accessing the Service that we just created
import UserService from '../services/users.service'

// Async Controller function to get the Users List
exports.getUsers = async function (req, res, next) {

  // Check the existence of the query parameters, If the exists doesn't exists assign a default value

  let page = req.query.page ? req.query.page : 1
  let limit = req.query.limit ? req.query.limit : 10

  try {

    let users = await UserService.getUsers({}, page, limit)

    // Return the users list with the appropriate HTTP Status Code and Message.

    return res.status(200).json({status: 200, data: users, message: 'Succesfully Users Recieved'})

  } catch (e) {

    //Return an Error Response Message with Code and the Error Message.

    return res.status(400).json({status: 400, message: e.message})

  }
}

exports.createUser = async function (req, res, next) {

  // Req.Body contains the form submit values.

  let user = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status
  }

  try {

    // Calling the Service function with the new object from the Request Body

    let createdUser = await UserService.createUser(user)
    return res.status(201).json({status: 201, data: createdUser, message: 'Succesfully Created BUser'})
  } catch (e) {

    //Return an Error Response Message with Code and the Error Message.

    return res.status(400).json({status: 400, message: 'BUser Creation was Unsuccesfull'})
  }
}

exports.updateUser = async function (req, res, next) {

  // Id is necessary for the update

  if (!req.body._id) {
    return res.status(400).json({status: 400., message: 'Id must be present'})
  }

  let id = req.body._id

  console.log(req.body)

  let user = {
    id,
    title: req.body.title ? req.body.title : null,
    description: req.body.description ? req.body.description : null,
    status: req.body.status ? req.body.status : null
  }

  try {
    let updatedUser = await UserService.updateUser(user)
    return res.status(200).json({status: 200, data: updatedUser, message: 'Succesfully Updated Tod'})
  } catch (e) {
    return res.status(400).json({status: 400., message: e.message})
  }
}

exports.removeUser = async function (req, res, next) {

  let id = req.params.id

  try {
    let deleted = await UserService.deleteUser(id)
    return res.status(204).json({status: 204, message: 'Succesfully BUser Deleted'})
  } catch (e) {
    return res.status(400).json({status: 400, message: e.message})
  }

}
