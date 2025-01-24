import { MongoClient, ServerApiVersion } from 'mongodb'

import { config } from 'dotenv'

config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@x-api.3iwfp.mongodb.net/?retryWrites=true&w=majority&appName=x-api`

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect()
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log('Pinged your deployment. You successfully connected to MongoDB!')
  } catch (error) {
    console.dir(error)
  }
}
