import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

interface UserType {
  _id: ObjectId
  name: string
  email: string
  date_of_birth: Date
  password: string
  created_at: Date
  updated_at: Date
  email_verify_at: Date | null // jwt hoặc '' nếu đã xác thực email
  changePasswordAt: Date | null // jwt hoặc '' nếu đã xác thực email
  verify: UserVerifyStatus
  twitter_circle?: string[]

  bio: string // optional
  location: string // optional
  website: string // optional
  username: string // optional
  avatar: string // optional
  cover_photo: string // optional
}

export interface UserRequest extends Pick<UserType, 'name' | 'email' | 'password'> {
  confirmPassword: string
  dob: string
}

export default class User {
  public _id: ObjectId
  public name: string
  public email: string
  public date_of_birth: Date
  public password: string
  public created_at: Date
  public updated_at: Date
  public email_verify_at: Date | null
  public changePasswordAt: Date | null
  public verify: UserVerifyStatus
  public twitter_circle: ObjectId[]

  public bio: string
  public location: string
  public website: string
  public username: string
  public avatar: string
  public cover_photo: string

  constructor(user: Partial<Omit<UserType, 'email' | 'password'>> & Pick<UserType, 'email' | 'password'>) {
    const date = new Date()
    this._id = new ObjectId()
    this.name = user.name || ''
    this.email = user.email
    this.date_of_birth = user.date_of_birth || date
    this.password = user.password
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.email_verify_at = null
    this.changePasswordAt = null
    this.verify = user.verify || UserVerifyStatus.Unverified
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.website = user.website || ''
    this.username = user.username || this.name + this._id.toString()
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
    this.twitter_circle = user.twitter_circle?.map((id) => new ObjectId(id)) || []
  }
}
