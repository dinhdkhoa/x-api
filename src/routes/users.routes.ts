import {Router} from 'express'
import { usersControllers } from '~/controllers'
import { loginValidation, registerValidation } from '~/middlewares/users.middleware'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router.route('/register').post(registerValidation, errorHandler(usersControllers.register))
router.route('/login').post(loginValidation, errorHandler(usersControllers.login))

const UsersRouter = router

export default UsersRouter