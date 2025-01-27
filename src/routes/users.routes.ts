import {Router} from 'express'
import { usersControllers } from '~/controllers'
import { registerValidation } from '~/middlewares/users.middleware'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router.route('/register').post(registerValidation, errorHandler(usersControllers.register))

const UsersRouter = router

export default UsersRouter