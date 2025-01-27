import {Router} from 'express'
import { usersControllers } from '~/controllers'
import { registerValidation } from '~/middlewares/users.middleware'

const router = Router()

router.route('/register').post(registerValidation, usersControllers.register)

const UsersRouter = router

export default UsersRouter