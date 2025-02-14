import { ForbiddenError, UnauthorizedError } from '~/models/errors.model'
import { TokenPayload, verifyJWT } from './jwt'
import { JsonWebTokenError } from 'jsonwebtoken'
import { UserVerifyStatus } from '~/constants/enum'

export const validateAccessToken = async (accessToken: string) => {
  try {
    const token = accessToken.split(' ')[1]
    if (!token) {
      throw new UnauthorizedError()
    }
    const jwtPayload = await verifyJWT({ token })
    return jwtPayload
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new UnauthorizedError(error.message)
    }
    throw error
  }
}

export const checkVerifiedUser = (decodedAccessToken: TokenPayload) => {
  const { verify } = decodedAccessToken
  if (verify !== UserVerifyStatus.Verified) throw new ForbiddenError('User is not verified')
}
