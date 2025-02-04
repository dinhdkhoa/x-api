import { Router } from 'express'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'
import { mediaControllers } from '~/controllers'
import { MediaService } from '~/services/media.services'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router.route('/images/:name').get(mediaControllers.getStaticFile(UPLOAD_IMAGE_DIR))
router.route('/videos/:name').get(mediaControllers.getStaticFile(UPLOAD_VIDEO_DIR))

const StaticRouter = router

export default StaticRouter
