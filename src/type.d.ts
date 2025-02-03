import { Request } from 'express'
import { TokenPayload } from './utils/jwt'
import User from './models/schemas/user.schema'

declare module 'express' {
  interface Request {
    user?: User
    decodedRefreshToken?: TokenPayload
    decodedAccessToken?: TokenPayload
    decodedEmailVerifyToken?: TokenPayload
  }
}