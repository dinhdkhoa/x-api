import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/request/tweet.requests'
import { TweetService } from '~/services'

export const createTweet = async (req: Request<{}, {}, TweetRequestBody>, res: Response) => {
  const { userId } = req.decodedAccessToken!
  const result = await TweetService.createTweet(userId, req.body)
  res.json({ message: 'Tweeted', result })
}
