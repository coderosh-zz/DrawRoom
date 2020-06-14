import socketio, { Server } from 'socket.io'

let io: Server

const init = (server: any) => {
  io = socketio(server)

  return io
}

export { init as default, io }
