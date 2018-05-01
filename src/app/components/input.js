import React from 'react'
import './input.scss'

import p from '../../../server/protocol'

class Input extends React.Component {
  constructor (props) {
    super(props)
  }

  sendNumber (e) {
    e.preventDefault()
    this.props.socket.send(JSON.stringify({
      type: p.MESSAGE_NUMBER,
      message: this.refs.numInput.value
    }))

    this.refs.numInput.value = ''
  }

  sendMessage (e) {
    e.preventDefault()
    this.props.socket.send(JSON.stringify({
      type: p.MESSAGE_SERVER_MESSAGE,
      message: this.refs.messageInput.value
    }))

    this.refs.messageInput.value = ''
  }

  render () {
    return (
      <div className="input">
        <form onSubmit={(e) => this.sendNumber(e)}>
          <label htmlFor="chat-input">Neue Zahl</label>
          <input autoComplete={'off'} ref="numInput" type="number" min="1" max="75" name="number" id="number"
                 className="four columns"/>
          <button type="submit">Senden</button>
        </form>
        <form onSubmit={(e) => this.sendMessage(e)}>
          <label htmlFor="chat-input">Nachricht an alle</label>
          <input autoComplete={'off'} ref="messageInput" type="text" name="message" id="message"
                 className="four columns"/>
          <button type="submit">Senden</button>
        </form>
      </div>
    )
  }
}

export default Input
