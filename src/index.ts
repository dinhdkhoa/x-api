import express from 'express'
import routes from './routes'
import mongoDB from './services/mongoDB.services'

const app = express()
const port = 4000

app.use(express.json())

mongoDB.connect()
app.use('/', routes)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
