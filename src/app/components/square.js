import React from 'react'

import './square.scss'

class Square extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      // topOffset: Math.floor(Math.random() * (8 - 3 + 1)) + 3 + '%',
      // leftOffset: Math.floor(Math.random() * (18 - 8 + 1)) + 8 + '%'
      topOffset: 12 + '%',
      leftOffset: 12 + '%'
    }
  }

  render () {
    const clicked = this.props.value.isClicked ? (
      <div className="clicked" style={{top: this.state.topOffset, left: this.state.leftOffset}}/>) : []
    return (
      <button className='square' onClick={this.props.onClick}>
        {clicked}
        {this.props.value.number}
      </button>
    )
  }
}

export default Square
