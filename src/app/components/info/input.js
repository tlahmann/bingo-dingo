import React from 'react'
import './input.scss'

import p from '../../protocol'

class Input extends React.Component
{
  constructor (props)
  {
    super(props)
  }

  sendNumber (e)
  {
    e.preventDefault()
    this.props.socket.send(JSON.stringify({
      type: p.MESSAGE_NUMBER,
      message: this.refs.numInput.value
    }))

    this.refs.numInput.value = ''
  }

  sendMessage (e)
  {
    e.preventDefault()
    this.props.socket.send(JSON.stringify({
      type: p.MESSAGE_SERVER_MESSAGE,
      message: this.refs.messageInput.value
    }))

    this.refs.messageInput.value = ''
  }

  chooseWinner (e)
  {
    e.preventDefault()
    let arr = this.props.bingos
    console.log(arr[Math.floor(Math.random() * arr.length)].nickname)
  }

  render ()
  {
    return (
      <div className="input">
        <form onSubmit={(e) => this.sendNumber(e)}>
          <label htmlFor="chat-input" className="row">Neue Zahl</label>
          <div className="row">
            <input autoComplete={'off'} ref="numInput" type="number" min="1" max="75" name="number" id="number"
              className="six columns" />
            <button type="submit" className="six columns">Senden</button>
          </div>
        </form>
        <form onSubmit={(e) => this.sendMessage(e)}>
          <label htmlFor="chat-input" className="row">Nachricht an alle</label>
          <div className="row">
            <input autoComplete={'off'} ref="messageInput" type="text" name="message" id="message"
              className="six columns" />
            <button type="submit" className="six columns">Senden</button>
          </div>
        </form>
        <form onSubmit={(e) => this.chooseWinner(e)}>
          <button type="submit">Gewinner Ermitteln</button>
        </form>
      </div>
    )
  }
}

export default Input
