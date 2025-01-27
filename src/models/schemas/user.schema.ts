import { ObjectId } from "mongodb"
import { UserVerifyStatus } from "~/constants/enum"


interface UserType {
  _id: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_token: string // jwt hoặc '' nếu đã xác thực email
  forgot_password_token: string // jwt hoặc '' nếu đã xác thực email
  verify: UserVerifyStatus

  bio: string // optional
  location: string // optional
  website: string // optional
  username: string // optional
  avatar: string // optional
  cover_photo: string // optional
}

export interface UserRequest extends Pick<UserType, 'name' | 'email' | 'password'> {
  confirmPassword: string,
  dob: string
}

export default class User {
  public _id: ObjectId
  private name: string
  private email: string
  private date_of_birth: Date
  private password: string
  private created_at: Date
  private updated_at: Date
  private email_verify_token: string
  private forgot_password_token: string
  private verify: UserVerifyStatus

  private bio: string
  private location: string
  private website: string
  private username: string
  private avatar: string
  private cover_photo: string

  constructor(user:  Partial<Omit<UserType, 'email' | 'password'>> & Pick<UserType, 'email' | 'password'>) {
    const date = new Date()
    this._id = new ObjectId()
    this.name = user.name || ''
    this.email = user.email
    this.date_of_birth = user.date_of_birth || date
    this.password = user.password
    this.created_at = user.created_at  || date
    this.updated_at = user.updated_at  || date
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
  }

}