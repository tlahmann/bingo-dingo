'use strict'

/***
 * Numbers service
 * @author Tobias Lahmann
 * on 09.05.2018
 */

// Getting the BUser mongoose Model
import BNumber from '../models/number.model'

// Async function to get the user List
exports.getNumbers = async function (query, page, limit) {
  // Options setup for the mongoose paginate
  let options = {
    page,
    limit
  }

  // Try Catch the awaited promise to handle the error
  try {
    // Return the user list that was retured by the mongoose promise
    return await BNumber.paginate(query, options)
  } catch (e) {
    // return a Error message describing the reason
    throw Error('Error occurred while paginating numbers')
  }
}

exports.createNumber = async function (number) {
  console.log(number)
  // Creating a new Mongoose Object by using the new keyword
  let newNumber = new BNumber({
    session: number.session,
    number: number.number
  })

  try {
    // Saving the BUser
    return await newNumber.save()
  } catch (e) {
    // return a Error message describing the reason
    throw Error('Error occurred while creating number')
  }
}
