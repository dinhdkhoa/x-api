import { TweetRequestBody } from '~/models/request/tweet.requests'
import collections from './collections.services'
import Tweet from '~/models/schemas/tweet.schema'
import { ObjectId } from 'mongodb'
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
  const results = await Promise.all(uniqueHashtags.map(async hashtag => {
    return await collections.hashtags.findOneAndUpdate({
      name: hashtag
    }, {
      $setOnInsert: new Hashtag({name: hashtag})
    }, {
      upsert: true,
      returnDocument: 'after'
    })
  }))
  return results.map(res => res!._id)
}