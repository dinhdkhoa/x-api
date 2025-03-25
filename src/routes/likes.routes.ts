import { Router } from 'express'
import { tweetIdValidator } from '~/middlewares/tweet.middleware'
import { accessTokenValidation, verifiedUserValidator } from '~/middlewares/users.middleware'
import { likeTweetController, unlikeTweetController } from '~/controllers/likes.controllers'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()
/**
 * Description: Like Tweet
 * Path: /
 * Method: POST
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token> }
 */
router.post('', accessTokenValidation, verifiedUserValidator, tweetIdValidator, errorHandler(likeTweetController))

/**
 * Description: Unlike Tweet
 * Path: /tweets/:tweet_id
 * Method: DELETE
 * Header: { Authorization: Bearer <access_token> }
 */
router.delete(
  '/tweets/:tweet_id',
  accessTokenValidation,
  verifiedUserValidator,
  tweetIdValidator,
  errorHandler(unlikeTweetController)
)

const LikesRouter = router
export default LikesRouter
