import React from 'react'
import './numbers.scss'
import './react-tabs.scss'

/***
 * Numbers component for the bingo game of Dicos live youtube stream
 */
class Numbers extends React.Component {
  constructor (props) {
    super(props)
  }

  isSelected (number) {
    return this.props.numberLog.some(n => +n.number === number)
  }

  isActive (number) {
    return this.props.numberLog
      .filter(n => +n.number === number)
      .every(n => Math.abs((new Date).getTime() - n.timestamp) < 2 * 60 * 60 * 1000)
  }

  renderRow (row) {
    let columns = []
    for (let i = 0; i < 5; i++) {
      let selected = this.isSelected(row + i * 15) ? 'selected' + (this.isActive(row + i * 15) ? ' active' : ' inactive') : ''
      columns.push(<td className={selected} key={row + i * 15}>{row + i * 15}</td>)
    }
    return <tr key={row}>{columns}</tr>
  }

  render () {
    let rows = []
    for (let i = 1; i <= 15; i++) {
      rows.push(this.renderRow(i))
    }

    return (
      <div id="numbers">
        <table>
          <thead>
          <tr>
            <th className="numbers-header-square">B</th>
            <th className="numbers-header-square">I</th>
            <th className="numbers-header-square">N</th>
            <th className="numbers-header-square">G</th>
            <th className="numbers-header-square">O</th>
          </tr>
          </thead>
          <tbody>
          {rows}
          </tbody>
        </table>
      </div>
    )
  }
}

export default Numbers
