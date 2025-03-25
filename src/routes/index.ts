import { Router } from 'express'
import UsersRouter from './users.routes.js'
import MediaRouter from './media.routes.js'
import { STATIC_FILE_ROUTE } from '~/constants/dir.js'
import StaticRouter from './static.routes.js'
import TweetRouter from './tweet.routes'
import BookmarksRouter from './bookmarks.routes.js'
import LikesRouter from './likes.routes.js'
import conversationsRouter from './conversations.routes.js'

const router = Router()
router.use('/users', UsersRouter)
router.use('/media', MediaRouter)
router.use('/tweet', TweetRouter)
router.use('/bookmarks', BookmarksRouter)
router.use('/likes', LikesRouter)
router.use('/conversations', conversationsRouter)
router.use(STATIC_FILE_ROUTE, StaticRouter)

const routes = router

export default routes
