'use strict'

import 'ts-polyfill';
import validator from 'validator'

export abstract class HelperFunctions {
  static lines = [
    // Horizontally
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],
    // Vertically
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],
    // Diagonal
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20]
  ]

  /**
   * Replace <, >, &, ', " and / with HTML entities.
   * This is to ensure that the values send in messages cannot harm any party
   *
   * @param input
   * @returns {*}
   */
  static sanitize(input) {
    input = input + ''
    return validator.escape(input)
  }

  /***
   * Returns the user input to be of string value
   * @param s
   * @returns {*}
   */
  static filterUserInput(s) {
    return s
  }

  static getRandomGameBoard(): [{ number:number, isClicked:boolean }] {
    // Fill array with numbers from 1-75
    let arr = []
    for (let j = 0; j < 5; ++j) {
      arr[j] = new Array(15)
      for (let i = 0; i < 15; ++i) {
        arr[j][i] = {
          number: j * 15 + i + 1,
          isClicked: false
        }
      }
      // Shuffle the arrays
      arr[j] = HelperFunctions.shuffle(arr[j]).slice(0, 5)
    }

    arr[2][2] = {
      number: 'FREI',
      isClicked: true
    }

    // Transpose and flatten the arrays
    return [].concat.apply([], HelperFunctions.transpose(arr))
  }

  static shuffle(array) {
    let tmp, current, top = array.length
    if (top) while (--top) {
      current = Math.floor(Math.random() * (top + 1))
      tmp = array[current]
      array[current] = array[top]
      array[top] = tmp
    }
    return array
  }

  static transpose(a) {
    // Calculate the width and height of the Array
    let w = a.length || 0
    let h = a[0] instanceof Array ? a[0].length : 0

    // In case it is a zero matrix, no transpose routine needed.
    if (h === 0 || w === 0) { return [] }

    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    let t = []
    // Loop through every item in the outer array (height)
    for (let i = 0; i < h; i++) {
      // Insert a new row (array)
      t[i] = []

      // Loop through every item per item in outer array (width)
      for (let j = 0; j < w; j++) {
        // Save transposed data.
        t[i][j] = a[j][i]
      }
    }

    return t
  }

  static getLines(): number[][] {
    return HelperFunctions.lines
  }

  static calculateWinner(board, lines) {
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c, d, e] = lines[i]
      if (board[a].isClicked && board[b].isClicked && board[c].isClicked && board[d].isClicked && board[e].isClicked) {
        lines.splice(i, 1)
      }
    }
    return lines
  }

  static clearLines(squares, lines) {
    return lines.map(line => {
      const [a, b, c, d, e] = line
      if (!(squares[a].isClicked && squares[b].isClicked && squares[c].isClicked && squares[d].isClicked && squares[e].isClicked)) {
        return line
      }
    }).filter(element => element !== undefined)
  }

  static countBingos(squares, lines) {
    return lines.map(line => {
      const [a, b, c, d, e] = line
      if (squares[a].isClicked && squares[b].isClicked && squares[c].isClicked && squares[d].isClicked && squares[e].isClicked) {
        return 1
      } else {
        return 0
      }
    }).reduce((s, b) => s + b, 0)
  }

  static countMissing(squares, lines, length) {
    return lines.map(l => {
      for (let subset of this.subsets(l)) {
        if (subset.length === length) {
          if (subset.every(i => squares[i].isClicked)) { return 1 }
        }
      }
    }).reduce((s, b) => s + (b || 0), 0)
  }

  static getMissing(squares, lines, length = 4) {
    // go through all possible lines
    return lines.map(l => {
      for (let subset of this.subsets(l)) {
        // go through all subsets of this line of specified length
        if (subset.length === length) {
          // if every square of this line is clicked we'll return the line
          if (subset.every(i => squares[i].isClicked)) {
            return squares[l.filter(n => {
              return subset.indexOf(n) === -1
            }).reduce(v => v)].number
          }
        }
      }
    })
  }

  public static formatDate(date: Date): String {
    return date.toISOString()
  }

  static * subsets(array, offset = 0) {
    while (offset < array.length) {
      let first = array[offset++]
      for (let subset of this.subsets(array, offset)) {
        subset.push(first)
        yield subset
      }
    }
    yield []
  }

  static findCommon(arr, nums) {
    if (arr.length === 0) {
      return -1
    }

    let max = arr[0]
    let maxIndex = 0

    for (let i = 1; i < arr.length; i++) {
      if (nums.some(n => +n.number === i)) continue
      if (arr[i] > max) {
        maxIndex = i
        max = arr[i]
      }
    }

    return maxIndex
  }
}
