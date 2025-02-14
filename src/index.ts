import cors from 'cors'
import express from 'express'
import { errorHandlerMiddleware } from './middlewares/errors-handler.middleware'
import routes from './routes'
import mongoDB from './services/mongoDB.services'
import { Server } from 'socket.io'
import initSocket from './socket'

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

const io = new Server(expressServer, {
  cors: {
    origin: process.env.CLIENT_DOMAIN_NAME
  }
})
initSocket(io)
