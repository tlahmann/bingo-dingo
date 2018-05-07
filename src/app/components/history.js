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

  render () {
    let nl = this.props.numberLog.slice()
    let ml = this.props.messageLog.slice()
    let history = nl.concat(ml)
    history = history.sort((x, y) => y.timestamp - x.timestamp)
    history = history.map(c => {
        // Calculate elapsed to tenth of a second:
        let remaining = 2 * 60 * 60 * 1000 - ((new Date).getTime() - c.timestamp)

        // let date = new Date(null)
        remaining = remaining > 0 ? remaining : 0
        let minutes = Math.floor(remaining / (1000 * 60)).toFixed(0)
        let seconds = Math.floor((remaining - minutes * 60 * 1000) / 1000).toFixed(0)
        // let seconds = date.toISOString().substr(11, 8)
        // console.log(date)
        // This will give a number with one digit after the decimal dot (xx.x):
        // let seconds = (remaining / 1000).toFixed(0)
        // seconds = seconds > 0 ? seconds : 0
        return (
          <li key={c.id}>
            <em className="time">
              {new Date(c.timestamp).toLocaleString()}
            </em>{': '}
            <strong className="message">{c.number || c.message}</strong>
            <small className="message u-pull-right">{minutes + ':' + seconds.padStart(2, '0')}</small>
          </li>
        )
      }
    )

    return (
      <div id="history">
        Historie
        {/*{recent}*/}
        <ul ref="list">
          {history}
        </ul>
      </div>
    )
  }
}

export default History
