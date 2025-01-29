import { Request } from 'express'
import { TokenPayload } from './utils/jwt'

declare module 'express' {
  interface Request {
    decodedRefreshToken?: TokenPayload
    decodedAccessToken?: TokenPayload
    decodedEmailVerifyToken?: TokenPayload
  }
}