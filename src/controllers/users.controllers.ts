import { Request, Response } from 'express'
import { Document, Filter, ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'
import { ErrorWithStatus, ForbiddenError, UnauthorizedError } from '~/models/errors.model'
import RefreshToken from '~/models/schemas/refreshToken.schema'
import User, { UserRequest } from '~/models/schemas/user.schema'
import collections from '~/services/collections.services'
import { hashPassword } from '~/utils/encrytion'
import { signJWT, TokenPayload } from '~/utils/jwt'

export async function checkUserExisted(email: string) {
  const user = await collections.users.findOne({ email })
  return user as User
}

export async function checkLoginCredentials(email: string, password: string) {
  const user = await collections.users.findOne({ email, password: hashPassword(password) })
  return user as User
}

async function signToken(userId: string, tokenType: TokenType, verify?: UserVerifyStatus) {
  return await signJWT({ payload: { userId, type: tokenType, verify } })
}

async function signCredentialTokens(userId: string, verify: UserVerifyStatus) {
  const [accessToken, refreshToken] = await Promise.all([
    signToken(userId, TokenType.AccessToken, verify),
    signToken(userId, TokenType.RefreshToken, verify)
  ])
  return { accessToken, refreshToken }
}

async function saveRefreshToken(token: RefreshToken) {
  // insert multiple tokens for one user to allow multiple devices login
  await collections.refreshTokens.insertOne(token)
  // const filter = { userId: token.userId };
  // const update = { $set: { token: token.token },  $setOnInsert: { created_at: token.created_at }}
  // const options = { upsert: true }
  // await collections.refreshTokens.updateOne(filter, update, options)
}

export async function register(req: Request<{}, {}, UserRequest>, res: Response) {
  const { dob, ...payload } = req.body

  const { insertedId } = await collections.users.insertOne(
    new User({
      ...payload,
      password: hashPassword(payload.password),
      date_of_birth: new Date(dob)
    })
  )

  const userId = insertedId.toString()
  const [{ accessToken, refreshToken }, emailVerifyToken] = await Promise.all([
    signCredentialTokens(userId, UserVerifyStatus.Unverified),
    signToken(userId, TokenType.EmailVerifyToken)
  ])
  await saveRefreshToken(new RefreshToken({ userId, token: refreshToken }))
  res.json({
    message: 'User registered successfully',
    accessToken,
    refreshToken
  })
}
export async function login(req: Request, res: Response) {
  const { _id, verify } = req.user!
  const userId = _id.toString()
  const { accessToken, refreshToken } = await signCredentialTokens(userId, verify)
  await saveRefreshToken(new RefreshToken({ userId, token: refreshToken }))
  res.json({
    message: 'Login successfully',
    data: { accessToken, refreshToken }
  })
}

export async function logout(req: Request, res: Response) {
  const decodedRefreshToken = req.decodedRefreshToken!
  const isDeleted = await collections.refreshTokens.findOneAndDelete({ userId: decodedRefreshToken.userId })
  if (isDeleted) {
    res.json({ message: 'Logout successfully' })
    return
  }
  throw new UnauthorizedError('Unable To Find Refresh Token')
}
export async function refreshUserToken(req: Request<{}, {}, { refreshToken: string }>, res: Response) {
  const { userId, verify, exp } = req.decodedRefreshToken!
  const { refreshToken } = req.body

  const [accessToken, newRefreshToken, isDeleted] = await Promise.all([
    signToken(userId, TokenType.AccessToken, verify),
    signJWT({ payload: { userId, type: TokenType.RefreshToken, verify, exp } }),
    collections.refreshTokens.deleteOne({ userId, token: refreshToken }, {})
  ])
  if (isDeleted.deletedCount == 0) throw new UnauthorizedError('Refresh Token Has Been Deleted')
  await saveRefreshToken(new RefreshToken({ userId, token: newRefreshToken }))

  res.json({
    message: 'Refreshed Token',
    accessToken,
    refreshToken: newRefreshToken
  })
}

export async function verifyEmail(req: Request, res: Response) {
  const decodedEmailVerifyToken = req.decodedEmailVerifyToken!
  const result = await collections.users.findOneAndUpdate(
    { _id: new ObjectId(decodedEmailVerifyToken.userId), email_verify_at: null, verify: UserVerifyStatus.Unverified },
    { $set: { verify: UserVerifyStatus.Verified }, $currentDate: { email_verify_at: true, updated_at: true } },
    { returnDocument: 'after' }
  )
  if (result) {
    res.json({ message: 'Email verified successfully' })
  } else {
    res.json({ message: 'Email is verified' })
  }
}

export async function changePasswordRequest(req: Request, res: Response) {
  const { _id, verify } = req.user!
  const forgot_password_token = await signToken(_id.toString(), TokenType.ForgotPasswordToken)
  // const result = await collections.users.findOneAndUpdate(
  //   { _id: new ObjectId(userIdFromMiddleware)},
  //   { $set: { forgot_password_token } , $currentDate: {updated_at:  true}},
  //   { returnDocument: 'after'}
  // )
  res.json({ message: `Password Change Has Been Sent To Your Email: ${forgot_password_token}` })
}

export async function changePassword(
  req: Request<{}, {}, { email: string; password: string; forgotPasswordToken: string; userIdFromMiddleware: string }>,
  res: Response
) {
  const { email, password, userIdFromMiddleware } = req.body
  const user = (await collections.users.findOne({ email, _id: new ObjectId(userIdFromMiddleware) })) as User

  if (!user) throw new ErrorWithStatus({ message: 'E-mail not found', status: HttpStatusCode.NotFound })

  if (user.verify == UserVerifyStatus.Unverified)
    throw new ForbiddenError('Change Password Not Allowed - Email is not verified')
  if (!canChangePassword(user.changePasswordAt))
    throw new Error('You cannot change your password yet. Please try again later.')

  const now = new Date()
  const filter = { _id: new ObjectId(user._id) }
  const update = { $set: { changePasswordAt: now, updated_at: now, password } }
  await collections.users.updateOne(filter, update)
  res.status(HttpStatusCode.OK).json({ message: 'Password changed successfully.' })
}

export function canChangePassword(changePasswordAt: Date | null, limitTime?: number): boolean {
  if (!changePasswordAt) {
    return true
  }

  const lastChangePassword = changePasswordAt.getTime()
  const currentTime = new Date().getTime()

  const differenceInMilliseconds = currentTime - lastChangePassword

  const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000

  return differenceInMilliseconds >= (limitTime ?? sevenDaysInMilliseconds)
}

async function getUserProfile(filter: Filter<User>) {
  const user = (await collections.users.findOne(
    { ...filter },
    {
      projection: {
        name: 1,
        email: 1,
        date_of_birth: 1,
        bio: 1,
        location: 1,
        website: 1,
        username: 1,
        avatar: 1,
        cover_photo: 1
      }
    }
  )) as User
  if (!user) throw new ErrorWithStatus({ message: 'User not found', status: HttpStatusCode.NotFound })
  return user
}

export async function getUser(req: Request, res: Response) {
  const { userId } = req.decodedAccessToken!
  const user = await getUserProfile({ _id: new ObjectId(userId) })

  res.json({ data: user })
}

export async function updateProfile(req: Request, res: Response) {
  // const {userId} = req.decodedAccessToken!
  // const user = await getUserProfile(userId)
  res.json({ data: req.body })
}
export async function getPublicProfile(req: Request<{ username: string }>, res: Response) {
  const { username } = req.params
  const user = await getUserProfile({ username })
  res.json({ user })
}
