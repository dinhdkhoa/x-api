import { Router } from 'express'
import { mediaControllers } from '~/controllers'
import { MediaService } from '~/services/media.services'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router.route('/:name').get(mediaControllers.getImage)

const StaticRouter = router

export default StaticRouter
