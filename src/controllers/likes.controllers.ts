import { Request, Response } from 'express'
import { LikeTweetReqBody } from '~/models/request/like.requests'
import { LikeService } from '~/services'

export const likeTweetController = async (req: Request<{}, any, LikeTweetReqBody>, res: Response) => {
  const { user_id } = req.decodedAccessToken!
  const result = await LikeService.likeTweet(user_id, req.body.tweet_id)
  res.json({
    message: 'LIKE_MESSAGES.LIKE_SUCCESSFULLY',
    result
  })
}

export const unlikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decodedAccessToken!
  await LikeService.unlikeTweet(user_id, req.params.tweet_id)
  res.json({
    message: 'LIKE_MESSAGES.UNLIKE_SUCCESSFULLY'
  })
}
