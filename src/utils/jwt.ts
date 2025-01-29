import jwt , {JwtPayload, SignOptions, VerifyErrors} from 'jsonwebtoken'
import { TokenType } from '~/constants/enum'

const JWT_SECRET = process.env.JWT_SECRET as string
const ACCESSS_TOKEN_EXPIRES_IN = process.env.ACCESSS_TOKEN_EXPIRES_IN as any
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN as any
const EMAIL_VERIFY_TOKEN_EXPIRES_IN = process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as any
const FORGOT_PASSWORD_TOKEN_EXPIRES_IN = process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as any

interface JWTSignParams {
  payload: any & {type?: TokenType },
  privateKey?: string,
  options?: SignOptions
}
interface JWTVerifyParams {
  token: string,
  secretOrPublicKey?: jwt.Secret | jwt.PublicKey | jwt.GetPublicKeyOrSecret
}

export interface TokenPayload extends JwtPayload {
  userId: string
  type: TokenType
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
      case TokenType.EmailVerifyToken:
        options.expiresIn = EMAIL_VERIFY_TOKEN_EXPIRES_IN
        break
      default:
        options.expiresIn = FORGOT_PASSWORD_TOKEN_EXPIRES_IN
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
export const verifyJWT = ({token, secretOrPublicKey = JWT_SECRET}: JWTVerifyParams) => {
  return new Promise<TokenPayload>(async(resolve, reject) => {
    await jwt.verify(token, secretOrPublicKey, (err:  VerifyErrors | null, decoded: any) => {
      if (err) {
        reject(err)
      }
      resolve(decoded as TokenPayload) 
    })
})}