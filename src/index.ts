import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { Server } from 'socket.io'
import { corsConfig, rateLimiter, socketConfigOptions } from './config'
import { errorHandlerMiddleware } from './middlewares/errors-handler.middleware'
import routes from './routes'
import mongoDB from './services/mongoDB.services'
import initSocket from './socket'

mongoDB.connect()

const app = express()

app.use(cors(corsConfig))
app.use(helmet())
app.use(rateLimiter)

const port = process.env.PORT

app.use(express.json())

// app.get('/sendemail', (req, res, next) => {
//   sendEmailWithTemplate({content: 'Content', link: 'google.com', titleLink: 'Click',subject: 'Test Template', toAddresses: process.env.TEST_TO_ADDRESS || '' ,  title: 'Test Content'})
//   res.json({ok : 'ok'})
// })

app.use('/', routes)
// app.use(STATIC_FILE_ROUTE, express.static(UPLOAD_IMAGE_DIR))
app.use(errorHandlerMiddleware)

const expressServer = app.listen(port, () => {
  console.log(`App is running in ${process.env.NODE_ENV} on port ${port}`)
})

const io = new Server(expressServer, socketConfigOptions)
initSocket(io)
