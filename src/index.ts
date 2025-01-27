import express from 'express'
import routes from './routes'
import mongoDB from './services/mongoDB.services'
import { errorHandlerMiddleware } from './middlewares/errors-handler.middleware'

mongoDB.connect()

const app = express()
const port = 4000

app.use(express.json())

app.use('/', routes)
app.use(errorHandlerMiddleware)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
