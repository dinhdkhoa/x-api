import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'
import { ErrorWithStatus, UnauthorizedError } from '~/models/errors.model'
import RefreshToken from '~/models/schemas/refreshToken.schema'
import User, { UserRequest } from '~/models/schemas/user.schema'
import collections from '~/services/collections.services'
import { hashPassword } from '~/utils/encrytion'
import { signJWT, TokenPayload } from '~/utils/jwt'

export async function checkUserExisted(email: string, returnUser = false) {
  const users = await collections.users.findOne({ email })
  if (returnUser && users) return users as User
  return Boolean(users)
}

export async function checkLoginCredentials(email: string, password: string) {
  const user = await collections.users.findOne({ email, password: hashPassword(password) })
  if (user) return user._id.toString()
  return null
}

async function signToken(userId: string, tokenType: TokenType) {
  switch (tokenType) {
    case TokenType.AccessToken:
      return await signJWT({ payload: { userId, type: TokenType.AccessToken } })

    case TokenType.RefreshToken:
      return await signJWT({ payload: { userId, type: TokenType.RefreshToken } })

    case TokenType.EmailVerifyToken:
      return await signJWT({ payload: { userId, type: TokenType.EmailVerifyToken } })
    default:
      return await signJWT({ payload: { userId, type: TokenType.ForgotPasswordToken } })
  }
}

async function signCredentialTokens(userId: string) {
  const [accessToken, refreshToken] = await Promise.all([signToken(userId, TokenType.AccessToken), signToken(userId, TokenType.RefreshToken)])
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
    signCredentialTokens(userId),
    signToken(userId, TokenType.EmailVerifyToken)
  ])
  console.log(emailVerifyToken)
  await saveRefreshToken(new RefreshToken({ userId, token: refreshToken }))
  res.json({
    message: 'User registered successfully',
    accessToken,
    refreshToken
  })
}
export async function login(req: Request<{}, {}, { userIdFromMiddleware: string }>, res: Response) {
  const { userIdFromMiddleware } = req.body
  const { accessToken, refreshToken } = await signCredentialTokens(userIdFromMiddleware)
  await saveRefreshToken(new RefreshToken({ userId: userIdFromMiddleware, token: refreshToken }))
  res.json({
    message: 'Login successfully',
    accessToken,
    refreshToken
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

export async function changePasswordRequest(
  req: Request<{}, {}, { email: string; userIdFromMiddleware: string }>,
  res: Response
) {
  const { userIdFromMiddleware } = req.body
  const forgot_password_token = await signToken(userIdFromMiddleware, TokenType.ForgotPasswordToken)
  // const result = await collections.users.findOneAndUpdate(
  //   { _id: new ObjectId(userIdFromMiddleware)},
  //   { $set: { forgot_password_token } , $currentDate: {updated_at:  true}},
  //   { returnDocument: 'after'}
  // )
  res.json({ message: `Password Change Has Been Sent To Your Email: ${forgot_password_token}` })
}

export async function changePassword(
  req: Request<{}, {}, { email: string; password: string; forgotPasswordToken: string, userIdFromMiddleware: string }>,
  res: Response
) {
  const { email, password , userIdFromMiddleware} = req.body
  const user = (await collections.users.findOne({ email , _id: new ObjectId(userIdFromMiddleware) })) as User

  if (!user) throw new ErrorWithStatus({ message: 'E-mail not found', status: HttpStatusCode.NotFound })
  const hashPW = hashPassword(password)
  if (user.password == hashPW) throw new UnauthorizedError('Password Cannot Be The Same')
  if (user.verify == UserVerifyStatus.Unverified) throw new UnauthorizedError('Change Password Not Allowed - Email is not verified')
  if (!canChangePassword(user.changePasswordAt)) throw new Error('You cannot change your password yet. Please try again later.')

  const now = new Date()
  const filter = { _id: new ObjectId(user._id)}
  const update = { $set: { changePasswordAt: now, updated_at: now, password: hashPW}}
  await collections.users.updateOne(filter, update)
  res.status(HttpStatusCode.OK).json({ message: 'Password changed successfully.' })
}

export function canChangePassword(changePasswordAt: Date | null, limitTime? :number): boolean {
  if (!changePasswordAt) {
    return true
  }

  const lastChangePassword = changePasswordAt.getTime()
  const currentTime = new Date().getTime()

  const differenceInMilliseconds = currentTime - lastChangePassword

  const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000

  return differenceInMilliseconds >= (limitTime ?? sevenDaysInMilliseconds)
}

