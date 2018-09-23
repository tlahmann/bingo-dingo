import React from 'react'
import './board.scss'
import Square from './square'

import p from '../../../../server/protocol'

class Board extends React.Component {
  constructor (props) {
    super(props)
  }

  handleClick (i) {
    const isClicked = this.props.board[i].isClicked
    // If already clicked return

    if (isClicked || !this.props.numberLog
      .filter(n => (new Date()).getTime() - n.timestamp < 2 * 60 * 60 * 1000)
      .some(x => parseInt(x.number) === this.props.board[i].number)) {
      return
    }

    this.props.socket.send(JSON.stringify({
      type: p.MESSAGE_CLICK,
      data: { number: this.props.board[i].number }
    }))

    // Else, change the state of the clicked button
    this.props.board[i].isClicked = !isClicked
    this.forceUpdate()
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
    return <div className='board-row' key={row}>{columns}</div>
  }

  render () {
    let rows = []
    for (let i = 0; i < 5; i++) {
      rows.push(this.renderRow(i))
    }
    return (<div>
      <div className='board-row' key='header'>
        <div className='header-square'>B</div>
        <div className='header-square'>I</div>
        <div className='header-square'>N</div>
        <div className='header-square'>G</div>
        <div className='header-square'>O</div>
      </div>
      {rows}
    </div>)
  }
}

export default Board
