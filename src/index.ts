import path from 'path'
import express from 'express'

import init from './socket'

const app = express()

app.use(express.static(path.join(__dirname, '..', 'public')))

const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})

init(server)
