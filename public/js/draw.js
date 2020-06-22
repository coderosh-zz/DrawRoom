const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
let isDrawing = false
let props = { x: 0, y: 0, pX: 0, pY: 0, color: 'black', width: 10 }
const socket = io()

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
})

if (!username || !room) {
  location.href = '/'
}

socket.emit('join', { username, room }, (err) => {
  if (err) {
    location.href = `/?err=${err}`
  }
})

window.addEventListener('resize', canvasSize)
canvasSize()
function canvasSize() {
  canvas.height = window.innerHeight
  canvas.width = window.innerWidth
}

socket.on('draw', function (data) {
  draw(data)
})

socket.on('roomData', ({ room, users }) => {
  document.querySelector('.room-name').textContent = room
  let html = ''
  users.forEach((user) => {
    html += `<li>${user.username}</li>`
  })
  document.querySelector('.users').innerHTML = html
})

socket.on('notification', (message) => {
  Push.create('DrawRoom', {
    body: message,
    // icon: '/icon.png',
    timeout: 4000,
    onClick: function () {
      window.focus()
      this.close()
    },
  })
})

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true
  props.pX = e.clientX
  props.pY = e.clientY
  mouseMoved(e)
})
canvas.addEventListener('touchstart', (e) => {
  isDrawing = true
  props.pX = e.touches[0].clientX
  props.pY = e.touches[0].clientY
  mouseMoved(e)
})

canvas.addEventListener('mousemove', throttle(mouseMoved))
canvas.addEventListener('touchmove', throttle(mouseMoved))

canvas.addEventListener('mouseup', function (e) {
  isDrawing = false
})
canvas.addEventListener('touchend', function (e) {
  isDrawing = false
})

function draw(props) {
  ctx.beginPath()
  ctx.lineWidth = props.width
  ctx.strokeStyle = props.color
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.moveTo(props.x, props.y)
  ctx.lineTo(props.pX, props.pY)
  ctx.stroke()
  ctx.closePath()
}

function mouseMoved(e) {
  if (!isDrawing) return

  props.x = e.clientX || e.touches[0].clientX
  props.y = e.clientY || e.touches[0].clientY

  props.color = document.querySelector('#color').value
  props.width = document.querySelector('#width').value

  // let cBounds = canvas.getBoundingClientRect()
  // props.pX -= cBounds.x
  // props.pY -= cBounds.y

  socket.emit('move', props)
  draw(props)

  props.pX = props.x
  props.pY = props.y
}

document.querySelector('#clear').addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
})

document.querySelector('#settings').addEventListener('click', () => {
  isDrawing = false
})

function throttle(callback, delay = 10) {
  let previousCall = new Date().getTime()
  return function () {
    let time = new Date().getTime()

    if (time - previousCall >= delay) {
      previousCall = time
      if (isDrawing) console.log('Hey')
      callback.apply(null, arguments)
    }
  }
}
