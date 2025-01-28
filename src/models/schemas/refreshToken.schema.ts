import { ObjectId } from "mongodb"
import { UserVerifyStatus } from "~/constants/enum"


interface RefreshTokenType {
  _id?: ObjectId
  userId: string,
  created_at?: Date,
  token: string,
}

export default class RefreshToken {
  public _id?: ObjectId
  public created_at: Date
  public token: string
  public userId: string

  constructor( {_id, token, userId}: RefreshTokenType) {
    this._id = _id
    this.created_at = new Date()
    this.token = token
    this.userId = userId
  }
}