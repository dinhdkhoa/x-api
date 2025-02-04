import { Router } from 'express'
import { mediaControllers } from '~/controllers'
import { MediaService } from '~/services/media.services'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router.route('/upload').post(errorHandler(mediaControllers.uploadImages))
router.route('/upload/videos').post(errorHandler(mediaControllers.uploadVideos))

const MediaRouter = router

export default MediaRouter
