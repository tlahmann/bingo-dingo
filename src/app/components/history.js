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
    history = history.map(c =>
      (
        <li key={c.id}>
          <em className="time">
            {new Date(c.timestamp).toLocaleString()}
          </em>{': '}
          <strong className="message">{c.number || c.message}</strong>
        </li>
      ))
    // let recent = this.props.numberLog.map(c =>
    //   (
    //     <div className="badge" key={c.id + 'last'}>
    //       <span className="badgeContent">
    //         {c.number}
    //       </span>
    //     </div>
    //   ))

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
