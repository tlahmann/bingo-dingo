import React from 'react'

import './stats.scss'

class Stats extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    return (
      <div id="stats">
        <div className="row">
          <div className="eight columns">
            <strong>Wert</strong>
          </div>
          <div className="four columns">
            <strong>Anzahl</strong>
          </div>
        </div>
        <div className="row">
          <div className="eight columns">
            geklickte Felder
          </div>
          <div className="four columns">
            {this.props.stats.completion}
          </div>
        </div>
        {/*<div className="row">
          <div className="eight columns">
            nicht geklickte Felder
          </div>
          <div className="four columns">
            deactivated
            {this.props.stats.misses}
          </div>
        </div>*/}
        <div className="row">
          <div className="eight columns">
            Bingos
          </div>
          <div className="four columns">
            {this.props.stats.bingos}
          </div>
        </div>
      </div>
    )
  }
}

export default Stats
