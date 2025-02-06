import { Collection, Db } from 'mongodb'
import mongoDB from './mongoDB.services'
import User from '~/models/schemas/user.schema'
import RefreshToken from '~/models/schemas/refreshToken.schema'
import Tweet from '~/models/schemas/tweet.schema'
import Hashtag from '~/models/schemas/hashtags.schema'
import Bookmark from '~/models/schemas/Bookmark.schema'
import Like from '~/models/schemas/likes.schema'

const collectionName = {
  users: 'users',
  refreshTokens: 'refreshTokens',
  tweets: 'tweets',
  hashtags: 'hashtags',
  bookmarks: 'bookmarks',
  likes: 'likes'
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
  static get hashtags() {
    return this.getCollection<Hashtag>(collectionName.hashtags)
  }
  static get bookmarks() {
    return this.getCollection<Bookmark>(collectionName.bookmarks)
  }
  static get likes() {
    return this.getCollection<Like>(collectionName.likes)
  }
}

const collections = CollectionManager

export default collections
