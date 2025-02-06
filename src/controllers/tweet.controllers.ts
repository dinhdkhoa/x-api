import { Request, Response } from 'express'
import { TweetType } from '~/constants/enum'
import { TweetParam, TweetQuery, TweetRequestBody } from '~/models/request/tweet.requests'
import { TweetService } from '~/services'

export const createTweet = async (req: Request<{}, {}, TweetRequestBody>, res: Response) => {
  const { userId } = req.decodedAccessToken!
  const result = await TweetService.createTweet(userId, req.body)
  res.json({ message: 'Tweeted', result })
}

export const getTweetController = async (req: Request, res: Response) => {
  const result = await TweetService.increaseView(req.params.tweet_id, req.decodedAccessToken?.user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
    updated_at: result.updated_at
  }
  res.json({
    message: 'Get Tweet Successfully',
    result: tweet
  })
}

export const getTweetChildrenController = async (req: Request, res: Response) => {
  const tweet_type = Number(req.query.tweet_type) as TweetType
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const { userId } = req.decodedAccessToken!
  const { total, tweets } = await TweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
    user_id: userId
  })
  res.json({
    message: 'Get Tweet Children Successfully',
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit)
    }
  })
}
