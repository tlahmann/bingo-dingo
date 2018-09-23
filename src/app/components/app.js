import React from 'react'
import Modal from 'react-modal'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import validator from 'validator'

import p from '../../../server/protocol'
import Board from './game/board'
import Input from './info/input'
import History from './info/history'
import Numbers from './info/numbers'
import Users from './info/users'
import Stats from './info/stats'

import './app.scss'
import './info/react-tabs.scss'

const loginStyle = {
  content: {
    top: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '100',
    backgroundColor: 'rgb(77, 175, 74)'
  }
}

const bannedStyle = {
  content: {
    top: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '100',
    backgroundColor: 'rgb(228, 26, 28)'
  }
}

Modal.setAppElement('#root')

class App extends React.Component {
  onSocketOpen () {
    this.client.getAvailableRooms('bingo', function (rooms, err) {
      console.log(rooms)
    })
  }

  sendPacket (type, data) {
    let msg = JSON.stringify({
      type: type,
      data: data
    })
    this.socket.send(msg)
  }

  // listen to patches coming from the server
  playerChange (change) {
    let board = change.value.board
    this.setState({ board: board })
    this.forceUpdate()
  }

  onClick () {
    if (
      this.state.desiredNameValid &&
            !this.state.passwordRequired &&
            !this.state.pending
    ) {
      this.sendPacket(p.MESSAGE_REQUEST_NICKNAME, {
        nickname: this.state.desiredName
      })
      this.state.pending = true
    } else {
      this.sendPacket(p.MESSAGE_AUTHENTICATE, {
        nickname: this.state.desiredName,
        password: this.state.password
      })
      this.state.pending = true
    }
  }

  onSubmit (e) {
    e.preventDefault()
    this.onClick()
  }

  onChangeNickname (v) {
    this.state.desiredName = validator.escape(v)
    this.sendPacket(p.MESSAGE_CHECK_NICKNAME, { nickname: v })
  }

  onChangePassword (v) {
    this.state.password = v
  }

  onSocketClose () {
    let err = {
      id: 'SERVER_ERROR',
      timestamp: new Date().getTime(),
      message: 'Die verbindung zum Server wurde unterbrochen.'
    }
    this.state.messageLog.push(err)
    this.forceUpdate()
    // this.socket.connect('ws://' + window.location.hostname + ':8021')
    // setTimeout(() => {
    //     // TODO: Limit the amount of retries!
    // TODO: maybe just reconnect instead of reloading
    //     window.location.reload()
    //   },
    //   3000
    // )
  }

  openModal (modal) {
    let state = {}
    if (modal === 'login') {
      state = { modalIsOpen: { login: true, error: false } }
    } else if (modal === 'error') {
      state = { modalIsOpen: { login: false, error: true } }
    } else {
      return
    }
    this.setState(state)
  }

  afterOpenModal () {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00'
  }

  closeModal () {
    this.setState({ modalIsOpen: { login: false, error: false } })
  }

  reset (e) {
    e.preventDefault()
    this.socket.send(
      JSON.stringify({
        type: p.MESSAGE_GAME_RESET,
        message: null
      })
    )
    this.forceUpdate()
  }

  addListeners () {
    this.room.onJoin.add(function () {
      console.log('joined!')
    })

    this.room.onLeave.add(function () {
      console.log('LEFT ROOM', arguments)
    })

    this.room.onStateChange.add(function (data) {
      console.log('Room update: ', data)
    })

    this.room.listen('players/:id', (change) => this.playerChange(change))
  }

  constructor (props) {
    super(props)

    const host = window.document.location.host.replace(/:.*/, '')
    this.client = new Colyseus.Client(
      location.protocol.replace('http', 'ws') + host + ':8080'
    )
    this.room = this.client.join('bingo', { create: true })
    this.addListeners()

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
      role: 'user',
      modalIsOpen: { login: false, error: false },
      board: new Array(25).fill({ number: 0, isClicked: false })
    }

    this.openModal = this.openModal.bind(this)
    this.afterOpenModal = this.afterOpenModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
  }

  componentDidMount () {
    /* this.socket = new WebSocket('ws://' + window.location.hostname + ':8021')
      this.socket.onopen = () => this.onSocketOpen()
      this.socket.onmessage = (m) => this.onSocketData(m)
      this.socket.onclose = () => this.onSocketClose() */
  }

  render () {
    return (
      <div id='app'>
        <header className='row'>
          <h1>Dicos Bingo</h1>
        </header>
        <div className='game row'>
          <div className='game-board six columns'>
            <Board
              socket={this.socket}
              board={this.state.board}
              numberLog={this.state.numberLog}
            />
          </div>
          <div id='game-info' className='game-info six columns'>
            <h5>Spielinfo</h5>
            <Tabs>
              <TabList>
                <Tab>Historie</Tab>
                <Tab>Nummern</Tab>
                <Tab>Spieler</Tab>
                <Tab>Statistik</Tab>
                <Tab>Regeln</Tab>
                {this.state.role === 'admin' ? <Tab>Interaktion</Tab> : []}
                {this.state.role === 'admin' ? <Tab>Zurücksetzten</Tab> : []}
              </TabList>

              <TabPanel>
                <History
                  numberLog={this.state.numberLog}
                  messageLog={this.state.messageLog}
                />
              </TabPanel>
              <TabPanel>
                <Numbers numberLog={this.state.numberLog} />
              </TabPanel>
              <TabPanel>
                <Users
                  users={this.state.userList}
                  me={this.state.desiredName}
                  moderating={
                    this.state.role === 'admin' ||
                this.state.role === 'moderator'
                  }
                  socket={this.socket}
                />
              </TabPanel>
              <TabPanel>
                <Stats stats={this.state.stats} />
              </TabPanel>
              {
                <TabPanel>
                  <div id='rules'>
                    <ul className='row'>
                      <li className='twelve columns'>
                                                Im Bingo existieren 75 durchnummerierte Kugeln (1-75)
                      </li>
                      <li className='twelve columns'>
                                                Dico wird in bestimmten Zeitabständen live im Stream
                                                neue Zahlen ziehen und diese im Spiel freigeben
                      </li>
                      <li className='twelve columns'>
                                                Sobald eine Zahl in der Historie auftaucht kann sie auf
                                                dem Spielfeld angeklickt werden
                      </li>
                      <li className='twelve columns'>
                                                Jede Zahl kann nur für 2 Stunden geklickt werden, damit
                                                später eintreffende Spieler keinen allzugroßen Vorteil
                                                haben. Dies wird durch einen Timer in der Historie
                                                angezeigt.
                      </li>
                      <li className='twelve columns'>
                                                Ein Bingo wird erreicht, wenn ein Spieler eine
                                                vertikale, horizontale oder diagonale Linie auf seinem
                                                Spielfeld markiert hat
                      </li>
                      <li className='twelve columns'>
                                                Ein Bingo bedeutet nicht, dass das Spiel vorbei ist.
                                                Alle können weiter mitspielen.
                      </li>
                      <li className='twelve columns'>
                                                Fall es von Dico angekündigt ist, wird am Ende eines
                                                Streams ein Preis verlost. Um an der Verlosung
                                                teilnehmen zu dürfen muss der Spieler im Bingo online
                                                sein. Unter allen anwesenden Spielern, die ein Bingo
                                                erreicht haben wird ein Gewinner ausgelost.
                      </li>
                      <li className='twelve columns'>
                                                Die Admins und Moderatoren behalten sich das Recht vor
                                                Spieler ohne Angabe von Gründen vom Spiel zu entfernen
                                                oder gänzlich auszuschließen.
                      </li>
                    </ul>
                  </div>
                </TabPanel>
              }
              {this.state.role === 'admin' ? (
                <TabPanel>
                  <Input
                    socket={this.socket}
                    bingos={this.state.stats.bingosPlayers}
                  />
                </TabPanel>
              ) : (
                []
              )}
              {this.state.role === 'admin' ? (
                <TabPanel>
                  <button
                    type='submit'
                    className='danger'
                    onClick={e => this.reset(e)}
                  >
                                        Zurücksetzen
                  </button>
                </TabPanel>
              ) : (
                []
              )}
            </Tabs>
            <a
              href='https://github.com/tlahmann/bingo-dingo'
              target='_blank'
              className='u-pull-left'
              aria-label='Fork tlahmann/bingo-dingo on GitHub'
            >
              <img
                height='36'
                style={{ border: '0px', height: '36px' }}
                src='./github_fork.png'
                border='0'
                alt='Fork this Project on GitHub'
              />
            </a>
            <a
              href='https://ko-fi.com/E1E5C1W2'
              target='_blank'
              className='u-pull-right'
            >
              <img
                height='36'
                style={{ border: '0px', height: '36px' }}
                src='https://az743702.vo.msecnd.net/cdn/kofi5.png?v=0'
                border='0'
                alt='Buy Me a Coffee at ko-fi.com'
              />
            </a>
            <button type='submit' onClick={e => this.onSocketOpen()}>
                            foobar
            </button>
          </div>
        </div>
        <Modal
          isOpen={this.state.modalIsOpen.login}
          onAfterOpen={this.afterOpenModal}
          style={loginStyle}
          contentLabel='Example Modal'
        >
          <h2>Wie möchtest du genannt werden?</h2>
          <form onSubmit={e => this.onSubmit(e)} action='#'>
            <div className='row'>
              <label htmlFor='nickname' className='two columns'>
                                Name:{' '}
              </label>
              <input
                autoComplete={'off'}
                onChange={v => this.onChangeNickname(v.target.value)}
                type='text'
                name='nickname'
                id='nickname'
                className='ten columns'
              />
            </div>
            {this.state.requireLogin ? (
              <div className='row'>
                <label htmlFor='password' className='two columns'>
                                    Passwort:{' '}
                </label>
                <input
                  autoComplete={'off'}
                  onChange={v => this.onChangePassword(v.target.value)}
                  type='password'
                  name='password'
                  id='password'
                  className='ten columns'
                />
              </div>
            ) : (
              []
            )}
            <div className='row'>
              <strong className='eight columns'>
                {this.state.lastNameDetail}
              </strong>
              <button
                onClick={() => this.onClick()}
                className='login-btn four columns u-pull-right'
                disabled={
                  !this.state.desiredNameValid && !this.state.passwordRequired
                }
              >
                                Login
              </button>
            </div>
          </form>
        </Modal>
        <Modal
          isOpen={this.state.modalIsOpen.error}
          onAfterOpen={this.afterOpenModal}
          style={bannedStyle}
          contentLabel='Example Modal'
        >
          <strong className='twelve columns'>
            {this.state.lastNameDetail}
          </strong>
        </Modal>
      </div>
    )
  }
}

export default App
