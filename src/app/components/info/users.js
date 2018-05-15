import React from 'react'
import './users.scss'
import './react-tabs.scss'
import p from '../../../../server/protocol'

class Users extends React.Component {
  constructor (props) {
    super(props)
  }

  kickUser (e, userId) {
    e.preventDefault()
    this.props.socket.send(JSON.stringify({
      type: p.MESSAGE_USER_KICK,
      data: {userId: userId}
    }))
  }

  banUser (e, userId) {
    e.preventDefault()
    this.props.socket.send(JSON.stringify({
      type: p.MESSAGE_USER_BAN,
      data: {userId: userId}
    }))
  }

  render () {
    let btn = (id) => (this.props.moderating ?
      <div className="dropdown" style={{float: 'right'}}>
        <button className="dropbtn"/>
        <div className="dropdown-content">
          <button className="kickButton" onClick={(e) => this.kickUser(e, id)}>Kick User</button>
          <button className="kickButton" onClick={(e) => this.banUser(e, id)}>Ban User</button>
        </div>
      </div> : [])
    let admins = this.props.users.filter(u => u.role === 'admin')
    admins = admins.map(u =>
      (
        <li className={'user admin'} key={u.id}><i className="fas fa-chess-king"/> {u.nickname}
        </li>
      ))
    let moderators = this.props.users.filter(u => u.role === 'moderator')
    moderators = moderators.map(u =>
      (
        <li className={'user moderator'} key={u.id}><i className="fas fa-star"/> {u.nickname}</li>
      ))

    let registered = this.props.users.filter(u => u.nickname && u.role !== 'admin' && u.role !== 'moderator')
    let users = registered.map(u =>
      (
        <li className={'user' + (u.nickname === this.props.me ? ' me' : '')} key={u.id}>{u.nickname} {btn(u.id)}</li>
      ))

    let unregistered = this.props.users.filter(u => !u.nickname)
    if (unregistered.length > 0) {
      users.push(<li className={'guest'} key={'guest'}>Gast ({unregistered.length})</li>)
    }

    return (
      <div id="users">
        <ul ref="list">
          {admins || 'None'}
          {moderators || 'None'}
          {users || 'None'}
        </ul>
      </div>
    )
  }
}

export default Users
