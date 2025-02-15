import cors from 'cors'
import express from 'express'
import { errorHandlerMiddleware } from './middlewares/errors-handler.middleware'
import routes from './routes'
import mongoDB from './services/mongoDB.services'
import { Server } from 'socket.io'
import initSocket from './socket'
import helmet from 'helmet'
import { corsConfig, envConfig, rateLimiter, socketConfigOptions } from './config'
import { config } from 'dotenv'

mongoDB.connect()

const app = express()

app.use(cors(corsConfig))
app.use(helmet())
app.use(rateLimiter)

const port = process.env.PORT

app.use(express.json())

app.use('/', routes)
// app.use(STATIC_FILE_ROUTE, express.static(UPLOAD_IMAGE_DIR))
app.use(errorHandlerMiddleware)

const expressServer = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const io = new Server(expressServer, socketConfigOptions)
initSocket(io)
