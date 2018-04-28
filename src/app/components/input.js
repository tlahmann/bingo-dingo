import React from 'react'
import './input.scss'

import p from '../../../server/protocol'

class Input extends React.Component {
  constructor (props) {
    super(props)
  }

  onSubmit (e) {
    e.preventDefault()
    this.props.socket.send(JSON.stringify({
      type: p.MESSAGE_NUMBER,
      message: this.refs.input.value
    }))

    this.refs.input.value = ''
    this.forceUpdate()
  }

  render () {
    return (
      <div className="input">
        <form onSubmit={(e) => this.onSubmit(e)}>
          <label htmlFor="chat-input">Neue Zahl</label>
          <input autoComplete={'off'} ref="input" type="number" min="1" max="75" name="message" id="message"
                 className="four columns"/>
          <button type="submit">Senden</button>
        </form>
      </div>
    )
  }
}

export default Input
