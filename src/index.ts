import express from 'express'
import routes from './routes'
import mongoDB from './services/mongoDB.services'
import { errorHandlerMiddleware } from './middlewares/errors-handler.middleware'
import { STATIC_FILE_ROUTE, UPLOAD_IMAGE_DIR } from './constants/dir'
import { Server } from 'socket.io'
import cors from 'cors'
import collections from './services/collections.services'
import Conversation from './models/schemas/Conversations.schema'
import { ObjectId } from 'mongodb'

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
  socket.addListener('send_private_message', async (args: { content: string; receiver_id: string }) => {
    const { receiver_id, content } = args
    // if (!socketConnectingUserId[to]?.socket_id) return
    const newConvo = new Conversation({
      content,
      receiver_id: new ObjectId(receiver_id),
      sender_id: new ObjectId(userId)
    })
    const result = await collections.conversations.insertOne(newConvo)
    socket.to(socketConnectingUserId[receiver_id].socket_id).emit('reply_private_message', {
      ...newConvo,
      _id: result.insertedId
    })
  })
  socket.addListener('disconnect', (args) => {
    delete socketConnectingUserId[userId]
    console.log(`${socket.id} disconnected`)
  })
})
