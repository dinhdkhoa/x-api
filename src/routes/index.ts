import {Router} from 'express'
import UsersRouter from './users.routes.js'

const router = Router()
router.use('/users', UsersRouter)

const routes = router

export default routes