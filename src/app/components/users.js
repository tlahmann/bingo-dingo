import React from 'react'
import './users.scss'
import './react-tabs.scss'

class Users extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    let btn = (this.props.moderating ? <button className="kickBtn u-pull-right"/> : [])
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
        <li className={'user'} key={u.id}>{u.nickname} {btn}</li>
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
