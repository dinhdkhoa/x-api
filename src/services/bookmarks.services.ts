import { ObjectId, WithId } from 'mongodb'
import collections from './collections.services'
import Bookmark from '~/models/schemas/Bookmark.schema'

export async function bookmarkTweet(user_id: string, tweet_id: string) {
  const result = await collections.bookmarks.findOneAndUpdate(
    {
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    },
    {
      $setOnInsert: new Bookmark({
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      })
    },
    {
      upsert: true,
      returnDocument: 'after'
    }
  )
  return result
}
export async function unbookmarkTweet(user_id: string, tweet_id: string) {
  const result = await collections.bookmarks.findOneAndDelete({
    user_id: new ObjectId(user_id),
    tweet_id: new ObjectId(tweet_id)
  })
  return result
}
