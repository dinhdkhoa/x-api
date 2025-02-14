import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'
import Conversation from '~/models/schemas/Conversations.schema'
import collections from '~/services/collections.services'
import { TokenPayload } from '~/utils/jwt'
import { checkVerifiedUser, validateAccessToken } from '~/utils/validate-token'

const socketConnectingUserId: {
  [key: string]: {
    socket_id: string
  }
} = {}

const initSocket = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const tokenPayload = await validateAccessToken(socket.handshake.auth.Authorization)
      socket.handshake.auth.decodedAccessToken = tokenPayload
      checkVerifiedUser(tokenPayload)
      next()
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      })
    }
  })

  io.on('connection', (socket) => {
    console.log(`${socket.id} connected`)
    const { userId } = socket.handshake.auth.decodedAccessToken as TokenPayload
    socket.use(async (event, next) => {
      try {
        await validateAccessToken(socket.handshake.auth.Authorization)
        next()
      } catch (error: any) {
        next(new Error('Unauthorized'))
      }
    })
    socket.on('error', (error) => {
      if (error.message == 'Unauthorized') socket.disconnect()
    })
    socketConnectingUserId[userId] = {
      socket_id: socket.id
    }

    socket.on('send_private_message', async (args: { content: string; receiver_id: string }) => {
      const { receiver_id, content } = args
      // if (!socketConnectingUserId[to]?.socket_id) return
      const newConvo = new Conversation({
        content,
        receiver_id: new ObjectId(receiver_id),
        sender_id: new ObjectId(userId)
      })
      const result = await collections.conversations.insertOne(newConvo)
      if (socketConnectingUserId[receiver_id]?.socket_id) {
        socket.to(socketConnectingUserId[receiver_id].socket_id).emit('reply_private_message', {
          ...newConvo,
          _id: result.insertedId
        })
      }
    })
    socket.on('disconnect', (args) => {
      delete socketConnectingUserId[userId]
      console.log(`${socket.id} disconnected`)
    })
  })
}

export default initSocket
