import { Request, Response } from 'express'
import { BookmarkTweetReqBody } from '~/models/request/bookmark.requests'
import { BookmarkService } from '~/services'

export const bookmarkTweetController = async (req: Request<{}, any, BookmarkTweetReqBody>, res: Response) => {
  const { user_id } = req.decodedAccessToken!
  const result = await BookmarkService.bookmarkTweet(user_id, req.body.tweet_id)
  res.json({
    message: 'BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY',
    result
  })
}

export const unbookmarkTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decodedAccessToken!
  await BookmarkService.unbookmarkTweet(user_id, req.params.tweet_id)
  res.json({
    message: 'BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY'
  })
}
