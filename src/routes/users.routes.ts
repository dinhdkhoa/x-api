import {Router} from 'express'
import { usersControllers } from '~/controllers'
import { loginValidation, accessTokenValidation, registerValidation, refreshTokenValidation, emailVerifyValidation, changePasswordEmailValidation, changePasswordValidation } from '~/middlewares/users.middleware'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router.route('/register').post(registerValidation, errorHandler(usersControllers.register))
router.route('/login').post(loginValidation, errorHandler(usersControllers.login))
router.route('/logout').post(accessTokenValidation, refreshTokenValidation, errorHandler(usersControllers.logout))
router.route('/verify').post(emailVerifyValidation, errorHandler(usersControllers.verifyEmail))
router.route('/request-change-password').post(changePasswordEmailValidation, errorHandler(usersControllers.changePasswordRequest))
router.route('/change-password').post(changePasswordValidation, errorHandler(usersControllers.changePassword))

const UsersRouter = router

export default UsersRouter