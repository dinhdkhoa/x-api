import { ObjectId, WithId } from 'mongodb'
import collections from './collections.services'
import Like from '~/models/schemas/likes.schema'

export async function likeTweet(user_id: string, tweet_id: string) {
  const result = await collections.likes.findOneAndUpdate(
    {
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    },
    {
      $setOnInsert: new Like({
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
export async function unlikeTweet(user_id: string, tweet_id: string) {
  const result = await collections.likes.findOneAndDelete({
    user_id: new ObjectId(user_id),
    tweet_id: new ObjectId(tweet_id)
  })
  return result
}
