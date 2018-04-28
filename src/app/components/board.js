import React from 'react'
import './board.scss'
import Square from './square'
import Helper from './HelperFunctions'

import p from '../../../server/protocol'

class Board extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      helper: new Helper()
    }
  }

  handleClick (i) {
    const isClicked = this.props.board[i].isClicked
    // If already clicked return
    if (isClicked || !this.props.numberLog.some(x => parseInt(x.number) === this.props.board[i].number)) {
      return
    }

    this.props.socket.send(JSON.stringify({
      type: p.MESSAGE_CLICK,
      data: {number: this.props.board[i].number}
    }))

    // Else, change the state of the clicked button
    this.props.board[i].isClicked = !isClicked
    this.forceUpdate()

    // and calculate if the player has won
    let l = this.state.helper.calculateWinner(this.props.board)
    if (l) {
      this.props.socket.send(JSON.stringify({
        type: p.MESSAGE_WINNER,
        data: {line: l}
      }))
    }
  }

  renderSquare (i) {
    return (
      <Square
        value={this.props.board[i]}
        onClick={() => this.handleClick(i)}
        key={i.toString()}
      />
    )
  }

  renderRow (row) {
    let columns = []
    for (let i = 0; i < 5; i++) {
      columns.push(this.renderSquare(i + row * 5))
    }
    return <div className="board-row" key={row}>{columns}</div>
  }

  render () {
    let rows = []
    for (let i = 0; i < 5; i++) {
      rows.push(this.renderRow(i))
    }
    return <div>{rows}</div>
  }
}

export default Board
