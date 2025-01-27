import jwt , {SignOptions} from 'jsonwebtoken'
import { TokenType } from '~/constants/enum'

const JWT_SECRET = process.env.JWT_SECRET as string
const ACCESSS_TOKEN_EXPIRES_IN = process.env.ACCESSS_TOKEN_EXPIRES_IN as any
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN as any

interface JWTSignParams {
  payload: any & {type?: TokenType },
  privateKey?: string,
  options?: SignOptions
}
export const signJWT = ({payload, privateKey = JWT_SECRET, options = {algorithm: 'HS256'}}: JWTSignParams) => {
  if (payload.type || payload.type === 0) {
    switch (payload.type) {
      case TokenType.AccessToken:
        options.expiresIn = ACCESSS_TOKEN_EXPIRES_IN
        break
      case TokenType.RefreshToken:
        options.expiresIn = REFRESH_TOKEN_EXPIRES_IN
        break
      default:
        break
    }
  }
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (err, token) => {
      if (err) {
        reject(err)
      }
      resolve(token as string) 
    })
  })
}