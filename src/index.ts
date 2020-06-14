import path from 'path'
import express from 'express'
import socketio from 'socket.io'

const app = express()

app.use(express.static(path.join(__dirname, '..', 'public')))

const PORT = process.env.PORT
const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})

const io = socketio(server)

io.on('connection', socket => {
  console.log(socket.id)
})
