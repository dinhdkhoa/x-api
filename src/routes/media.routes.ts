import { Router } from 'express'
import { MediaService } from '~/services/media.services'

const router = Router()

router.route('/upload').post(MediaService.uploadFile)


const MediaRouter = router

export default MediaRouter