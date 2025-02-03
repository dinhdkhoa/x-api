import {Router} from 'express'
import UsersRouter from './users.routes.js'
import MediaRouter from './media.routes.js'

const router = Router()
router.use('/users', UsersRouter)
router.use('/media', MediaRouter)

const routes = router

export default routes