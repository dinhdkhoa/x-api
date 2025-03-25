import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweet.middleware'
import { accessTokenValidation, verifiedUserValidator } from '~/middlewares/users.middleware'
import { BookmarkService } from '~/services'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

/**
 * Description: Bookmark Tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
router.post('', accessTokenValidation, verifiedUserValidator, tweetIdValidator, errorHandler(bookmarkTweetController))

/**
 * Description: Unbookmark Tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
router.delete(
  '/tweets/:tweet_id',
  accessTokenValidation,
  verifiedUserValidator,
  tweetIdValidator,
  errorHandler(unbookmarkTweetController)
)

const bookmarksRouter = router

export default bookmarksRouter
