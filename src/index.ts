import express from 'express'
import { run } from './config'

const app = express()
const port = 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

run()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
