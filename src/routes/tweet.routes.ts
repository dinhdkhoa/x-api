import { Router } from 'express'
import { createTweet, getTweetChildrenController, getTweetController } from '~/controllers/tweet.controllers'
import { paginationValidator } from '~/middlewares/common.middleware'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  tweetIdValidator
} from '~/middlewares/tweet.middleware'
import { accessTokenValidation, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router.route('/').post(accessTokenValidation, verifiedUserValidator, createTweetValidator, errorHandler(createTweet))
router.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidation),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  errorHandler(getTweetController)
)
router.get(
  '/:tweet_id/children',
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidation),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  errorHandler(getTweetChildrenController)
)
const TweetRouter = router

export default TweetRouter
