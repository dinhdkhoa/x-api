import { Router } from 'express'
import { conversationControllers } from '~/controllers'
import { getConversationsController } from '~/controllers/conversations.controllers'
import { paginationValidator } from '~/middlewares/common.middleware'
import { accessTokenValidation, verifiedUserValidator } from '~/middlewares/users.middleware'
import { errorHandler } from '~/utils/error-handlers'

const conversationsRouter = Router()

conversationsRouter.get(
  '/receiver/:receiver_id',
  accessTokenValidation,
  verifiedUserValidator,
  paginationValidator,
  // getConversationsValidator,
  errorHandler(conversationControllers.getConversationsController)
)

export default conversationsRouter
