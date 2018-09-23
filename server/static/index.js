var host = window.document.location.host.replace(/:.*/, '')
var client = new Colyseus.Client(location.protocol.replace('http', 'ws') + host + (location.port ? ':' + location.port : ''))
var room

client.onOpen.add(function () {
  console.log('onOpen')
})

function addListeners (room) {
  room.onJoin.add(function () {
    console.log(room.id)
    console.log('joined!')
  })

  room.onLeave.add(function () {
    console.log('LEFT ROOM', arguments)
  })

  room.onStateChange.add(function (data) {
    console.log('Room update: ', data)
  })
}

function join () {
  room = client.join('bingo')
  addListeners(room)
}

function create () {
  room = client.join('bingo', { create: true })
  addListeners(room)
}

function joinByLastId () {
  room.send({
    type: 'MESSAGE_CLICK',
    data: { number: 10 }
  })
}

function getAvailableRooms () {
  client.getAvailableRooms('bingo', function (rooms, err) {
    console.log(rooms)
  })
}
