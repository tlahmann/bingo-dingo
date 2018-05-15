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
        <div className="row"
             title="Die Anzahl der Spieler, die aktuell mit dem Spiel verbunden sind und einen Namen angegeben haben (keine Gäste)">
          <div className="eight columns">
            Spieler online
          </div>
          <div className="four columns">
            {this.props.stats.usersOnline}
          </div>
        </div>
        <div className="row" title="Die Anzahl der in diesem Spiel gezogenen Nummern">
          <div className="eight columns">
            Nummern gezogen
          </div>
          <div className="four columns">
            {this.props.stats.numbersDrawn}
          </div>
        </div>
        <div className="row" title="Die Anzahl der Felder, die insgesamt Spielern markiert wurden">
          <div className="eight columns">
            geklickte Felder
          </div>
          <div className="four columns">
            {this.props.stats.completion}
          </div>
        </div>
        <div className="row" title="Die Anzahl der Felder, welche geklickt werden könnten, es aber nicht sind">
          <div className="eight columns">
            klickbare Felder
          </div>
          <div className="four columns">
            {this.props.stats.misses}
          </div>
        </div>
        <div className="row" title="Die Anzahl der Bingos von aktiven Spielern">
          <div className="eight columns">
            Bingos
          </div>
          <div className="four columns">
            {this.props.stats.bingos}
          </div>
        </div>
        <div className="row" title="Die Anzahl der Reihen in der eine Zahl zum Bingo fehlt">
          <div className="eight columns">
            Reihen in denen eine Zahl fehlt
          </div>
          <div className="four columns">
            {this.props.stats.oneToGo}
          </div>
        </div>
        <div className="row" title="Die Anzahl der Reihen in der zwei Zahlen zum Bingo fehlen">
          <div className="eight columns">
            Reihen in denen zwei Zahlen fehlen
          </div>
          <div className="four columns">
            {this.props.stats.twoToGo}
          </div>
        </div>
        <div className="row" title="Die Zahl, die den meisten Spielern weiterhilft">
          <div className="eight columns">
            Hilfreichste Zahl
          </div>
          <div className="four columns">
            {this.props.stats.common}
          </div>
        </div>
        <div className="row" title="Liste aktiver Spieler, die ein Bingo erreicht haben">
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
