import { Router } from 'express'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { mediaControllers, tweetControllers } from '~/controllers'
import { createTweetValidator } from '~/middlewares/tweet.middleware'
import { accessTokenValidation, verifiedUserValidator } from '~/middlewares/users.middleware'
import { MediaService } from '~/services/media.services'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router
  .route('/')
  .post(accessTokenValidation, verifiedUserValidator, createTweetValidator, errorHandler(tweetControllers.createTweet))

const TweetRouter = router

export default TweetRouter
