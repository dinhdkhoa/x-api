import { Request, Response } from 'express'
import { ConversationService } from '~/services'

export const getConversationsController = async (req: Request<any>, res: Response) => {
  const { receiver_id } = req.params
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const sender_id = req.decodedAccessToken!.userId
  const result = await ConversationService.getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  })
  res.json({
    result: {
      limit,
      page,
      total_page: Math.ceil(result.total / limit),
      conversations: result.conversations
    },
    message: 'Get conversations successfully'
  })
}
