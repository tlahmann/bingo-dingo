'use strict'

/***
 * BBoard model
 * @author Tobias Lahmann
 * on 07.05.2018
 */

import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate'

let BoardSchema = new mongoose.Schema({
  nickname: {type: String, required: true},
  session: {type: String, required: true},
  board: {
    type: [{
      number:
        {
          type: Number,
          min: 1,
          max: 75
        },
      isClicked: Boolean
    }],
    required: true
  }
})

BoardSchema.plugin(mongoosePaginate)
const Board = mongoose.model('Board', BoardSchema)

module.exports = Board
