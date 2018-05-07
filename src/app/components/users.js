import React from 'react'
import './users.scss'
import './react-tabs.scss'
import p from '../../../server/protocol'

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

  showDropdown (e) {
    e.preventDefault()
    document.getElementById('myDropdown').classList.toggle('show')
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
        <li className={'user'} key={u.id} style={{color: '#46b798'}}>&#9818; {u.nickname}</li>
      ))
    let moderators = this.props.users.filter(u => u.role === 'moderator')
    moderators = moderators.map(u =>
      (
        <li className={'user'} key={u.id} style={{color: '#5f84f1'}}>&#9733; {u.nickname}</li>
      ))

    let registered = this.props.users.filter(u => u.nickname && u.role !== 'admin' && u.role !== 'moderator')
    let users = registered.map(u =>
      (
        <li className={'user'} key={u.id}>{u.nickname} {btn(u.id)}</li>
      ))

    let unregistered = this.props.users.filter(u => !u.nickname)
    if (unregistered.length > 0) {
      users.push(<li className={'guest'} key={'guest'}>Gast ({unregistered.length})</li>)
    }

    return (
      <div id="users">
        Spieler
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
