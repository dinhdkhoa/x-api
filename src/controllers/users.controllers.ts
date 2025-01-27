import { Request, Response } from 'express'
import { TokenType } from '~/constants/enum'
import User, { UserRequest } from '~/models/schemas/user.schema'
import collections from '~/services/collections.services'
import { signJWT } from '~/utils/jwt'

export async function checkUserExisted(email: string) {
    const users = await collections.users.findOne({email})
    return Boolean(users)
}

async function signAccessToken(userId: string) {
  const accessToken = await signJWT({payload: {userId, type: TokenType.AccessToken}})
  return accessToken
}
async function signRefreshToken(userId: string) {
  const RefreshToken = await signJWT({payload: {userId, type: TokenType.RefreshToken}})
  return RefreshToken
}

export async function register(req: Request<{}, {},UserRequest>, res: Response) {
  try {
    const {dob, ...payload} = req.body
    const {insertedId} = await collections.users.insertOne(new User({
      ...payload,
      date_of_birth: new Date(dob)
    }))
    const userId = insertedId.toString()
    const [accessToken, refreshToken] = await Promise.all([signAccessToken(userId), signRefreshToken(userId)])
    res.json({
      message: 'User registered successfully',
      accessToken, refreshToken
    })
  } catch (error) {
    res.status(400).json({ error })
  }
}
