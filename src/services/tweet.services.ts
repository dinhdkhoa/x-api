import { TweetRequestBody } from '~/models/request/tweet.requests'
import collections from './collections.services'
import Tweet from '~/models/schemas/tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/hashtags.schema'
import { TweetType } from '~/constants/enum'

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

export async function getTweetChildren({
  tweet_id,
  tweet_type,
  limit,
  page,
  user_id
}: {
  tweet_id: string
  tweet_type: TweetType
  limit: number
  page: number
  user_id?: string
}) {
  const tweets = await collections.tweets
    .aggregate<Tweet>([
      {
        $match: {
          parent_id: new ObjectId(tweet_id),
          type: tweet_type
        }
      },
      {
        $lookup: {
          from: 'hashtags',
          localField: 'hashtags',
          foreignField: '_id',
          as: 'hashtags'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'mentions',
          foreignField: '_id',
          as: 'mentions'
        }
      },
      {
        $addFields: {
          mentions: {
            $map: {
              input: '$mentions',
              as: 'mention',
              in: {
                _id: '$$mention._id',
                name: '$$mention.name',
                username: '$$mention.username',
                email: '$$mention.email'
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: 'bookmarks',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'bookmarks'
        }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'likes'
        }
      },
      {
        $lookup: {
          from: 'tweets',
          localField: '_id',
          foreignField: 'parent_id',
          as: 'tweet_children'
        }
      },
      {
        $addFields: {
          bookmarks: {
            $size: '$bookmarks'
          },
          likes: {
            $size: '$likes'
          },
          retweet_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.Retweet]
                }
              }
            }
          },
          comment_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.Comment]
                }
              }
            }
          },
          quote_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.QuoteTweet]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          tweet_children: 0
        }
      },
      {
        $skip: limit * (page - 1) // Công thức phân trang
      },
      {
        $limit: limit
      }
    ])
    .toArray()
  const ids = tweets.map((tweet) => tweet._id as ObjectId)
  const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
  const date = new Date()
  const [, total] = await Promise.all([
    collections.tweets.updateMany(
      {
        _id: {
          $in: ids
        }
      },
      {
        $inc: inc,
        $set: {
          updated_at: date
        }
      }
    ),
    collections.tweets.countDocuments({
      parent_id: new ObjectId(tweet_id),
      type: tweet_type
    })
  ])

  tweets.forEach((tweet) => {
    tweet.updated_at = date
    if (user_id) {
      tweet.user_views += 1
    } else {
      tweet.guest_views += 1
    }
  })
  return {
    tweets,
    total
  }
}
