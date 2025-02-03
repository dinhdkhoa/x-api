import { ObjectId } from "mongodb"
import { UserVerifyStatus } from "~/constants/enum"


interface FollowersType {
  userId: string,
  followUserId: ObjectId,
}

export default class Followers {
  _id?: ObjectId
  created_at: Date
  followUserId: ObjectId
  userId: ObjectId

  constructor( {userId, followUserId}: FollowersType) {
    this._id = new ObjectId()
    this.created_at = new Date()
    this.userId = new ObjectId(userId)
    this.followUserId = new ObjectId(followUserId)
  }
}