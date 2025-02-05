import { Request, Response } from 'express'
import { TweetRequestBody } from '~/models/request/tweet.requests'

export const createTweet = async (req: Request<{}, {}, TweetRequestBody>, res: Response) => {
  res.json({ message: 'Image Upload Success' })
}
