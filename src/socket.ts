import socketio, { Server } from 'socket.io'
import { addUser, removeUser, getUser, getUsersInRoom } from './users'

let io: Server

const init = (server: any) => {
  io = socketio(server)

  io.on('connection', (socket) => {
    socket.on('join', (options, callback) => {
      const { error, user } = addUser({ id: socket.id, ...options })

      if (error) {
        return callback(error)
      }

      socket.join(user!.room)

      socket.broadcast
        .to(user!.room)
        .emit('notification', `${user!.username} joined the room`)

      socket.on('move', (data) => {
        // io.to(user!.room).emit('draw', data)
        socket.broadcast.to(user!.room).emit('draw', data)
      })

      io.to(user!.room).emit('roomData', {
        room: user!.room,
        users: getUsersInRoom(user!.room),
      })

      callback()
    })

    socket.on('disconnect', () => {
      const user = removeUser(socket.id)

      if (user) {
        socket
          .to(user!.room)
          .emit('notification', `${user!.username} left the room`)

        io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUsersInRoom(user.room),
        })
      }
    })
  })

  return io
}

export { init as default }
