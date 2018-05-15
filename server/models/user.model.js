'use strict'

/***
 * BUser model
 * @author Tobias Lahmann
 * on 07.05.2018
 */

import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'

let UserSchema = new mongoose.Schema({
  nickname: {type: String, required: true},
  role: {type: String, required: true},
  password: {type: String, required: false}
})

UserSchema.plugin(mongoosePaginate)
const User = mongoose.model('User', UserSchema)

module.exports = User
