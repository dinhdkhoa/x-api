import { Db, MongoClient, ServerApiVersion } from 'mongodb'

import { config } from 'dotenv'

config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PW}@${process.env.DB_NAME}.3iwfp.mongodb.net/?retryWrites=true&w=majority&appName=x-api`


class DatabaseService {
  private client: MongoClient
  public Db: Db

  constructor() {
    this.client =  new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })
    this.Db = this.client.db(process.env.DB_NAME)
  }

  async connect() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect()
      // Send a ping to confirm a successful connection
      await this.Db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.dir(error)
    }
  }
}

const mongoDB = new DatabaseService()

export default mongoDB