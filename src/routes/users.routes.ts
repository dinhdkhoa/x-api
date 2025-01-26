import {Router} from 'express'
import { usersControllers } from '~/controllers'

const router = Router()

router.route('/').get(usersControllers.getUsers)
router.route('/register').post(usersControllers.register)

const UsersRouter = router

export default UsersRouter