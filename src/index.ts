import express from 'express'
import routes from './routes'
import mongoDB from './services/mongoDB.services'
import { errorHandlerMiddleware } from './middlewares/errors-handler.middleware'
import { STATIC_FILE_ROUTE, UPLOAD_IMAGE_DIR } from './constants/dir'

mongoDB.connect()

const app = express()
const port = 4000

app.use(express.json())

app.use('/', routes)
// app.use(STATIC_FILE_ROUTE, express.static(UPLOAD_IMAGE_DIR))
app.use(errorHandlerMiddleware)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
