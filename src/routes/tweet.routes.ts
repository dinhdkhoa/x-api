import { Router } from 'express'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { mediaControllers, tweetControllers } from '~/controllers'
import { getTweetController } from '~/controllers/tweet.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  tweetIdValidator
} from '~/middlewares/tweet.middleware'
import { accessTokenValidation, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middleware'
import { MediaService } from '~/services/media.services'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router
  .route('/')
  .post(accessTokenValidation, verifiedUserValidator, createTweetValidator, errorHandler(tweetControllers.createTweet))
router.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidation),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  errorHandler(tweetControllers.getTweetController)
)
// router.get(
//   '/:tweet_id/children',
//   tweetIdValidator,
//   paginationValidator,
//   getTweetChildrenValidator,
//   isUserLoggedInValidator(accessTokenValidation),
//   isUserLoggedInValidator(verifiedUserValidator),
//   audienceValidator,
//   errorHandler(tweetControllers.getTweetChildrenController)
// )
const TweetRouter = router

export default TweetRouter
