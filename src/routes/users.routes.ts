import { Router } from 'express'
import { usersControllers } from '~/controllers'
import { filterBody } from '~/middlewares/common.middleware'
import {
  loginValidation,
  accessTokenValidation,
  registerValidation,
  refreshTokenValidation,
  emailVerifyValidation,
  changePasswordEmailValidation,
  changePasswordValidation,
  verifiedUserValidator
} from '~/middlewares/users.middleware'
import User from '~/models/schemas/user.schema'
import { errorHandler } from '~/utils/error-handlers'

const router = Router()

router.route('/register').post(registerValidation, errorHandler(usersControllers.register))
router.route('/login').post(loginValidation, errorHandler(usersControllers.login))
router.route('/logout').post(accessTokenValidation, refreshTokenValidation, errorHandler(usersControllers.logout))
router.route('/refresh-token').post(refreshTokenValidation, errorHandler(usersControllers.refreshUserToken))
router.route('/verify').post(emailVerifyValidation, errorHandler(usersControllers.verifyEmail))
router
  .route('/request-change-password')
  .post(changePasswordEmailValidation, errorHandler(usersControllers.changePasswordRequest))
router.route('/change-password').post(changePasswordValidation, errorHandler(usersControllers.changePassword))

router
  .route('/me')
  .get(accessTokenValidation, errorHandler(usersControllers.getUser))
  .patch(
    accessTokenValidation,
    verifiedUserValidator,
    filterBody<User>(['name', 'email']),
    errorHandler(usersControllers.updateProfile)
  )
router.route('/:username').get(errorHandler(usersControllers.getPublicProfile))

const UsersRouter = router

export default UsersRouter
