import { Request, Response } from 'express'
import { TokenType } from '~/constants/enum'
import RefreshToken from '~/models/schemas/refreshToken.schema'
import User, { UserRequest } from '~/models/schemas/user.schema'
import collections from '~/services/collections.services'
import { hashPassword } from '~/utils/encrytion'
import { signJWT } from '~/utils/jwt'

export async function checkUserExisted(email: string) {
    const users = await collections.users.findOne({email})
    return Boolean(users)
}

export async function checkLoginCredentials(email: string, password: string) {
    const user = await collections.users.findOne({email, password: hashPassword(password)})
    if(user) return user._id.toString() 
    return null
}

async function signAccessToken(userId: string) {
  const accessToken = await signJWT({payload: {userId, type: TokenType.AccessToken}})
  return accessToken
}
async function signRefreshToken(userId: string) {
  const RefreshToken = await signJWT({payload: {userId, type: TokenType.RefreshToken}})
  return RefreshToken
}

async function signTokens(userId: string) {
  const [accessToken, refreshToken] = await Promise.all([signAccessToken(userId), signRefreshToken(userId)])
  return {accessToken, refreshToken}
}

async function saveRefreshToken(token: RefreshToken) {
  const filter = { userId: token.userId };
  const update = { $set: { token: token.token },  $setOnInsert: { created_at: token.created_at }}
  const options = { upsert: true }
  await collections.refreshTokens.updateOne(filter, update, options)
}


export async function register(req: Request<{}, {},UserRequest>, res: Response) {
    const {dob, ...payload} = req.body
    const {insertedId} = await collections.users.insertOne(new User({
      ...payload,
      password: hashPassword(payload.password),
      date_of_birth: new Date(dob)
    }))
    const userId = insertedId.toString()
    const {accessToken, refreshToken} = await signTokens(userId)
    await saveRefreshToken(new RefreshToken({userId, token: refreshToken}))
    res.json({
      message: 'User registered successfully',
      accessToken, refreshToken
    })
}
export async function login(req: Request<{}, {}, {userIdFromMiddleware: string}>, res: Response) {
    const {userIdFromMiddleware} = req.body
    const {accessToken, refreshToken} = await signTokens(userIdFromMiddleware)
    await saveRefreshToken(new RefreshToken({userId: userIdFromMiddleware, token: refreshToken}))
    res.json({
      message: 'Login successfully',
      accessToken, refreshToken
    })
}
