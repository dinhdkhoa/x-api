import express from 'express'
import routes from './routes'
import mongoDB from './services/mongoDB.services'
import { errorHandlerMiddleware } from './middlewares/errors-handler.middleware'
import { STATIC_FILE_ROUTE, UPLOAD_IMAGE_DIR } from './constants/dir'
import { Server } from 'socket.io'
import cors from 'cors'

mongoDB.connect()

const app = express()
app.use(cors())
const port = 4000

app.use(express.json())

app.use('/', routes)
// app.use(STATIC_FILE_ROUTE, express.static(UPLOAD_IMAGE_DIR))
app.use(errorHandlerMiddleware)

const expressServer = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const socketConnectingUserId: {
  [key: string]: {
    socket_id: string
  }
} = {}
const io = new Server(expressServer, {
  cors: {
    origin: 'http://localhost:3000'
  }
})

io.on('connection', (socket) => {
  console.log(`${socket.id} connected`)
  const userId = socket.handshake.auth?._id
  socketConnectingUserId[userId] = {
    socket_id: socket.id
  }
  socket.addListener('send private message', (args: { payload: string; to: string }) => {
    const { to, payload } = args
    // if (!socketConnectingUserId[to]?.socket_id) return
    console.log(to, payload, socketConnectingUserId[to].socket_id)
    socket.to(socketConnectingUserId[to].socket_id).emit('reply private message', {
      from: userId,
      payload
    })
  })
  socket.addListener('disconnect', (args) => {
    delete socketConnectingUserId[userId]
    console.log(`${socket.id} disconnected`)
  })
})
