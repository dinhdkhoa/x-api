import { Request } from 'express'
import { TokenPayload } from './utils/jwt'
import User from './models/schemas/user.schema'
import Tweet from './models/schemas/tweet.schema'

declare module 'express' {
  interface Request {
    user?: User
    decodedRefreshToken?: TokenPayload
    decodedAccessToken?: TokenPayload
    decodedEmailVerifyToken?: TokenPayload
    tweet?: Tweet
  }
}
