import React from 'react'
import './users.scss'
import './react-tabs.scss'

class Users extends React.Component {
  constructor (props) {
    super(props)
  }

  render () {
    let admins = this.props.users.filter(u => u.isAdmin)
    admins = admins.map(u =>
      (
        <li className={'user'} key={u.id} style={{color: '#46b798'}}>&#9733; {u.nickname}</li>
      ))

    let registered = this.props.users.filter(u => u.nickname && !u.isAdmin)
    let users = registered.map(u =>
      (
        <li className={'user'} key={u.id}>{u.nickname}</li>
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
          {users || 'None'}
        </ul>
      </div>
    )
  }
}

export default Users
