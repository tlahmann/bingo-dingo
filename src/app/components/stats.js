import React from 'react'

import './stats.scss'

class Stats extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    let bingosPlayers = (this.props.stats.bingosPlayers || []).map(u =>
      (
        <span key={u.id}>{u.nickname}, </span>
      ))
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
            Spieler online
          </div>
          <div className="four columns">
            {this.props.stats.usersOnline}
          </div>
        </div>
        <div className="row">
          <div className="eight columns">
            Nummern gezogen
          </div>
          <div className="four columns">
            {this.props.stats.numbersDrawn}
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
        <div className="row">
          <div className="eight columns">
            klickbare Felder
          </div>
          <div className="four columns">
            {this.props.stats.misses}
          </div>
        </div>
        <div className="row">
          <div className="eight columns">
            Bingos
          </div>
          <div className="four columns">
            {this.props.stats.bingos}
          </div>
        </div>
        <div className="row">
          <div className="eight columns">
            Reihen in denen eine Zahl fehlt
          </div>
          <div className="four columns">
            {this.props.stats.oneToGo}
          </div>
        </div>
        <div className="row">
          <div className="eight columns">
            Reihen in denen zwei Zahlen fehlen
          </div>
          <div className="four columns">
            {this.props.stats.twoToGo}
          </div>
        </div>
        <div className="row">
          <div className="eight columns">
            Hilfreichste Zahl
          </div>
          <div className="four columns">
            {this.props.stats.common}
          </div>
        </div>
        <div className="row">
          <div className="eight columns">
            Spieler, die ein Bingo haben
          </div>
          <div className="four columns">
            {bingosPlayers || 'None'}
          </div>
        </div>
      </div>
    )
  }
}

export default Stats
