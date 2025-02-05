import { TweetRequestBody } from '~/models/request/tweet.requests'
import collections from './collections.services'
import Tweet from '~/models/schemas/tweet.schema'
import { ObjectId } from 'mongodb'

export const createTweet = async (user_id: string, body: TweetRequestBody) => {
  const newTweet = new Tweet({
    audience: body.audience,
    content: body.content,
    hashtags: [], // Temporarily empty
    mentions: body.mentions,
    medias: body.medias,
    parent_id: body.parent_id,
    type: body.type,
    user_id: new ObjectId(user_id)
  })

  await collections.tweets.insertOne(newTweet)
  return newTweet
}
