import { Collection, Db } from 'mongodb'
import mongoDB from './mongoDB.services'
import User from '~/models/schemas/user.schema'
import RefreshToken from '~/models/schemas/refreshToken.schema'
import Tweet from '~/models/schemas/tweet.schema'

const collectionName = {
  users: 'users',
  refreshTokens: 'refreshTokens',
  tweets: 'tweets'
} as const

class CollectionManager {
  private static db: Db = mongoDB.Db

  private static getCollection<T>(name: (typeof collectionName)[keyof typeof collectionName]) {
    //@ts-ignore
    return this.db.collection<T>(name)
  }

  static get users() {
    return this.getCollection<User>(collectionName.users)
  }
  static get refreshTokens() {
    return this.getCollection<RefreshToken>(collectionName.refreshTokens)
  }
  static get tweets() {
    return this.getCollection<Tweet>(collectionName.tweets)
  }
}

const collections = CollectionManager

export default collections
