import { ObjectId } from 'mongodb'
import collections from './collections.services'

export async function getConversations({
  sender_id,
  receiver_id,
  limit,
  page
}: {
  sender_id: string
  receiver_id: string
  limit: number
  page: number
}) {
  const match = {
    $or: [
      {
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id)
      },
      {
        sender_id: new ObjectId(receiver_id),
        receiver_id: new ObjectId(sender_id)
      }
    ]
  }
  const conversations = await collections.conversations
    .find(match)
    .sort({ created_at: -1 })
    .skip(limit * (page - 1))
    .limit(limit)
    .toArray()
  const total = await collections.conversations.countDocuments(match)
  return {
    conversations,
    total
  }
}
