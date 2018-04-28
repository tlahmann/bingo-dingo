import React from 'react'
import Modal from 'react-modal'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import validator from 'validator'

import p from '../../../server/protocol'
import Board from './board'
import Input from './input'
import History from './history'
import Users from './users'
import Stats from './stats'

import './app.scss'
import './react-tabs.scss'

const customStyles = {
  content: {
    top: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '100',
    backgroundColor: 'rgb(70, 183, 152)'
  }
}

Modal.setAppElement('#root')

class App extends React.Component {
  onSocketOpen () {
    console.log('Connection established!')
  }

  sendPacket (type, data) {
    let msg = JSON.stringify({
      type: type,
      data: data
    })
    this.socket.send(msg)
  }

  onSocketData (message) {
    let decoded = JSON.parse(message.data)

    /***
     * If the user is not yet authenticated the modal dialog is opened by default. This will ask for the username and
     * close afterward
     */
    if (decoded.type === p.MESSAGE_WHO_ARE_YOU) {
      this.openModal()
      return
    }

    /***
     * If the game broadcasts a new message to the user it will be added to the log
     */
    if (decoded.type === p.MESSAGE_NUMBER) {
      this.state.numberLog.push(decoded.data)
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_USER_BOARD) {
      let board = decoded.data.board
      this.setState({board: board})
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_SERVER_MESSAGE) {
      this.state.messageLog.push(decoded.data)
      this.forceUpdate()
      return
    }

    /***
     * If the user joins the game he or she will receive the log in total enabling him or her to catch up on the
     * current game
     */
    if (decoded.type === p.MESSAGE_HISTORY) {
      this.setState({numberLog: decoded.data})
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_HELLO) {
      this.setState({isAdmin: decoded.data.isAdmin})
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_STATS) {
      this.setState({stats: decoded.data})
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_NICKNAME_GRANTED) {
      this.closeModal()
      this.state.desiredNameValid = true
      this.state.loggedIn = true
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_NAME_TOO_SHORT) {
      this.state.lastNameDetail = 'Nickname too short.'
      this.state.desiredNameValid = false
      this.state.requireLogin = false
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_NAME_IN_USE) {
      this.state.lastNameDetail = 'Nickname already in use.'
      this.state.desiredNameValid = false
      this.state.requireLogin = false
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_NAME_TOO_LONG) {
      this.state.lastNameDetail = 'Nickname too long.'
      this.state.desiredNameValid = false
      this.state.requireLogin = false
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_NAME_BAD_CHARACTERS) {
      this.state.lastNameDetail = 'Nickname contains invalid characters.'
      this.state.desiredNameValid = false
      this.state.requireLogin = false
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_NICKNAME_VALID) {
      this.state.lastNameDetail = ''
      this.state.desiredNameValid = true
      this.state.requireLogin = false
      this.state.passwordRequired = false
      this.state.pending = false
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_AUTHENTICATE) {
      this.state.lastNameDetail = 'This nickname is reserved and requires login'
      this.state.desiredNameValid = true
      this.state.requireLogin = true
      this.state.passwordRequired = true
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_USER_STATE_CHANGE) {
      this.state.userList
        .filter(u => u.id == decoded.data.id)
        .map(u => {
          if ('nickname' in decoded.data) {
            u.nickname = decoded.data.nickname
          }
          if ('isAdmin' in decoded.data) {
            u.isAdmin = decoded.data.isAdmin
          }
        })
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_USER_JOINS) {
      this.state.userList.push(decoded.data)
      this.forceUpdate()
      return
    }

    if (decoded.type === p.MESSAGE_USER_LEAVES) {
      let matches = this.state.userList.filter(
        u => u.id === decoded.data.id
      )

      if (matches && matches.length === 1) {
        this.state.userList.splice(
          this.state.userList.indexOf(matches[0]),
          1)
        this.forceUpdate()
      }
    }

    if (decoded.type === p.MESSAGE_USER_LIST) {
      this.state.userList = []
      decoded.data.map(u => this.state.userList.push(u))
      this.forceUpdate()
      return
    }
  }

  onClick () {
    if (this.state.desiredNameValid && !this.state.passwordRequired && !this.state.pending) {
      console.log(this.state.desiredName)
      this.sendPacket(p.MESSAGE_REQUEST_NICKNAME, {nickname: this.state.desiredName})
      this.state.pending = true
    } else {
      this.sendPacket(p.MESSAGE_AUTHENTICATE, {nickname: this.state.desiredName, password: this.state.password})
      this.state.pending = true
    }
  }

  onSubmit (e) {
    e.preventDefault()
    this.onClick()
  }

  onChangeNickname (v) {
    this.state.desiredName = validator.escape(v)
    this.sendPacket(p.MESSAGE_CHECK_NICKNAME, {nickname: v})
  }

  onChangePassword (v) {
    this.state.password = v
  }

  onSocketClose () {
    // this.socket.connect('ws://' + window.location.hostname + ':8021')
    // setTimeout(() => {
    //     // TODO: Limit the amount of retries!
    // TODO: maybe just reconnect instead of reloading
    //     window.location.reload()
    //   },
    //   3000
    // )
  }

  openModal () {
    this.setState({modalIsOpen: true})
  }

  afterOpenModal () {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00'
  }

  closeModal () {
    this.setState({modalIsOpen: false})
  }

  reset (e) {
    e.preventDefault()
    this.socket.send(JSON.stringify({
      type: p.MESSAGE_GAME_RESET,
      message: null
    }))
    this.forceUpdate()
  }

  constructor (props) {
    super(props)

    this.state = {
      numberLog: [],
      messageLog: [],
      stats: {},
      pending: false,
      loggedIn: false,
      desiredNameValid: false,
      requireLogin: false,
      lastNameDetail: '',
      desiredName: '',
      passwordRequired: false,
      password: '',
      userList: [],
      isAdmin: false,
      modalIsOpen: false,
      board: (new Array(25)).fill({number: 0, isClicked: false})
    }

    this.openModal = this.openModal.bind(this)
    this.afterOpenModal = this.afterOpenModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  componentDidMount () {
    this.socket = new WebSocket('ws://' + window.location.hostname + ':8021')
    this.socket.onopen = () => this.onSocketOpen()
    this.socket.onmessage = (m) => this.onSocketData(m)
    this.socket.onclose = () => this.onSocketClose()
  }

  render () {
    return (
      <div id="app">
        <header className="row">
          <h1>Dicos Bingo</h1>
        </header>
        <div className="game row">
          <div className="game-board seven columns">
            <Board
              socket={this.socket}
              board={this.state.board}
              numberLog={this.state.numberLog}
            />
          </div>
          <div id="game-info" className="game-info five columns">
            <h5>Spielinfo</h5>
            <Tabs>
              <TabList>
                <Tab>Historie</Tab>
                <Tab>Spieler</Tab>
                <Tab>Statistik</Tab>
                <Tab>Regeln</Tab>
                {this.state.isAdmin ? <Tab>Zahlen eingeben</Tab> : []}
                {/*{this.state.isAdmin ? <Tab>Zurücksetzten</Tab> : []}*/}
              </TabList>

              <TabPanel>
                <History
                  numberLog={this.state.numberLog}
                  messageLog={this.state.messageLog}
                />
              </TabPanel>
              <TabPanel>
                <Users
                  users={this.state.userList}
                />
              </TabPanel>
              <TabPanel>
                <Stats
                  stats={this.state.stats}
                />
              </TabPanel>
              <TabPanel>
                <div id="rules">
                  Spielregeln
                  <div className="row">
                    <div className="twelve columns">
                      Dabei handelt es sich in der Regel um 75 durchnummerierte Kugeln (1-75).
                      Bei dem Caller handelt es sich also um den Spielleiter, der dafür verantwortlich ist die Zahlen und zu ziehen, um diese dann anzusagen
                      Meistens werden 75 Kugeln verwendet
                      Der Caller sagt die gezogenen Zahlen an
                      Vollkommen willkürlich erfolgte Ziehung
                      Der Caller zieht Zahlen und sagt diese laut an
                      Die Spieler markieren die gezogene Zahl auf der Karte
                      Gewonnen hat der Spieler, der zuerst ein festgelegtes Muster markiert hat
                      Die Spielrunde ist beendet und es wird eine neue Karte eingesetzt
                    </div>
                  </div>
                </div>
              </TabPanel>
              {this.state.isAdmin ? <TabPanel>
                  <Input
                    socket={this.socket}
                  />
                </TabPanel>
                : []}
              {/*{this.state.isAdmin ? <TabPanel>
                  <button type="submit" className="danger" onClick={(e) => this.reset(e)}>Zurücksetzen</button>
                </TabPanel>
                : []}*/}
              {/*TODO: Add how to play*/}
            </Tabs>
            <a href='https://ko-fi.com/E1E5C1W2' target='_blank' className="u-pull-right">
              <img height='36' style={{border: '0px', height: '36px'}}
                   src='https://az743702.vo.msecnd.net/cdn/kofi4.png?v=0'
                   border='0' alt='Buy Me a Coffee at ko-fi.com'/>
            </a>
          </div>
        </div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <h2>Wie möchtest du genannt werden?</h2>
          <form onSubmit={(e) => this.onSubmit(e)} action="#">
            <div className="row">
              <label htmlFor="nickname" className="two columns">Name: </label>
              <input autoComplete={'off'} onChange={v => this.onChangeNickname(v.target.value)}
                     type="text"
                     name="nickname"
                     id="nickname"
                     className="ten columns"/>
            </div>
            {
              this.state.requireLogin ? <div className="row">
                <label htmlFor="password" className="two columns">Passwort: </label>
                <input autoComplete={'off'} onChange={v => this.onChangePassword(v.target.value)}
                       type="password"
                       name="password"
                       id="password"
                       className="ten columns"/>
              </div> : []
            }
            <div className="row">
              <strong className="eight columns">{this.state.lastNameDetail}</strong>
              <button onClick={() => this.onClick()} className="login-btn four columns u-pull-right"
                      disabled={!this.state.desiredNameValid && !this.state.passwordRequired}>
                Login
              </button>
            </div>
          </form>
          {

          }
        </Modal>
      </div>
    )
  }
}

export default App
