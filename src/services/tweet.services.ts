import { TweetRequestBody } from '~/models/request/tweet.requests'
import collections from './collections.services'
import Tweet from '~/models/schemas/tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/hashtags.schema'

export const createTweet = async (user_id: string, body: TweetRequestBody) => {
  const hashtags = await getOrAddHashtags(body.hashtags)
  const newTweet = new Tweet({
    audience: body.audience,
    content: body.content,
    hashtags,
    mentions: body.mentions,
    medias: body.medias,
    parent_id: body.parent_id,
    type: body.type,
    user_id: new ObjectId(user_id)
  })

  await collections.tweets.insertOne(newTweet)
  return newTweet
}

export const getOrAddHashtags = async (hashtags: string[]) => {
  const uniqueHashtags = Array.from(new Set(hashtags))
  const results = await Promise.all(
    uniqueHashtags.map(async (hashtag) => {
      return await collections.hashtags.findOneAndUpdate(
        {
          name: hashtag
        },
        {
          $setOnInsert: new Hashtag({ name: hashtag })
        },
        {
          upsert: true,
          returnDocument: 'after'
        }
      )
    })
  )
  return results.map((res) => res!._id)
}

export async function increaseView(tweet_id: string, user_id?: string) {
  const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
  const result = await collections.tweets.findOneAndUpdate(
    { _id: new ObjectId(tweet_id) },
    {
      $inc: inc,
      $currentDate: {
        updated_at: true
      }
    },
    {
      returnDocument: 'after',
      projection: {
        guest_views: 1,
        user_views: 1,
        updated_at: 1
      }
    }
  )
  return result! as WithId<{
    guest_views: number
    user_views: number
    updated_at: Date
  }>
}
