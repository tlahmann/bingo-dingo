'use strict'

/***
 * Number model
 * @author Tobias Lahmann
 * on 09.05.2018
 */

import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'

const Schema = mongoose.Schema
let exports = module.exports = {}

let BingoSessionNumberSchema = new Schema({
  session: {type: String, required: true},
  number: {
    type: Schema.ObjectId,
    ref: BingoNumber,
    required: true
  }
})

let BingoNumberSchema = new Schema({
  id: {type: String, required: true},
  timestamp: {type: Number, required: true},
  number: {type: Number, min: 1, max: 75, required: true}
})

BingoNumberSchema.plugin(mongoosePaginate)
BingoSessionNumberSchema.plugin(mongoosePaginate)

const BingoSessionNumber = mongoose.model('BingoSessionNumber', BingoSessionNumberSchema)
const BingoNumber = mongoose.model('BingoNumber', BingoNumberSchema)

exports.BingoSessionNumber = BingoSessionNumber
exports.BingoNumber = BingoNumber
