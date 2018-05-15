import React from 'react'
import './history.scss'
import './react-tabs.scss'

/***
 * History component for the bingo game of Dicos live youtube stream
 */
class History extends React.Component {
  constructor (props) {
    super(props)
  }

  formatDate (date) {
    let day = date.getDate().toString().padStart(2, '0')
    let month = (date.getMonth() + 1).toString().padStart(2, '0')
    let hours = date.getHours().toString().padStart(2, '0')
    let minutes = date.getMinutes().toString().padStart(2, '0')
    return day + '.' + month + ' ' + hours + ':' + minutes
  }

  render () {
    let nl = this.props.numberLog.slice()
    let ml = this.props.messageLog.slice()
    let history = nl.concat(ml)
    history = history.sort((x, y) => y.timestamp - x.timestamp)
    history = history.map(c => {
        // Calculate elapsed to tenth of a second:
        let remaining = 2 * 60 * 60 * 1000 - ((new Date).getTime() - c.timestamp)
        remaining = remaining > 0 ? remaining : 0
        let minutes = Math.floor(remaining / (1000 * 60)).toFixed(0)
        let seconds = Math.floor((remaining - minutes * 60 * 1000) / 1000).toFixed(0)
        return (
          <li key={c.id}>
            <em className="time" title={(new Date(c.timestamp)).toLocaleString()}>
              {this.formatDate(new Date(c.timestamp))}
            </em>{': '}
            <strong className="message">{c.number || c.message}</strong>
            <small className="message u-pull-right">{minutes + ':' + seconds.padStart(2, '0')}</small>
          </li>
        )
      }
    )

    return (
      <div id="history">
        <ul ref="list">
          {history}
        </ul>
      </div>
    )
  }
}

export default History
