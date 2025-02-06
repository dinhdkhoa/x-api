import { NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'
import { usersControllers } from '~/controllers'
import { canChangePassword } from '~/controllers/users.controllers'
import { ErrorWithStatus, ForbiddenError, UnauthorizedError } from '~/models/errors.model'
import { verifyJWT } from '~/utils/jwt'
import validate from '~/utils/validator'
import { Request, Response } from 'express'
import { hashPassword } from '~/utils/encrytion'

checkSchema({})

export const registerValidation = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: true,
        isString: true,
        isLength: {
          options: { min: 3, max: 50 }
        }
      },
      email: {
        trim: true,
        notEmpty: true,
        isEmail: true,
        custom: {
          options: async (email: string) => {
            const user = await usersControllers.checkUserExisted(email)
            if (user) {
              throw new Error('E-mail already in use')
            }
          }
        }
      },
      password: {
        trim: true,
        notEmpty: true,
        isString: true,
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            'Password must be at least 8 characters long, contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
        }
      },
      confirmPassword: {
        custom: {
          options: (value, { req }) => {
            if (value !== req.body.password) {
              throw new Error('Password confirmation does not match password')
            }
            return true
          }
        }
      },
      dob: {
        optional: true,
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          }
        }
      }
    },
    ['body']
  )
)

export const loginValidation = validate(
  checkSchema(
    {
      email: {
        trim: true,
        notEmpty: true,
        isEmail: true
      },
      password: {
        trim: true,
        notEmpty: true,
        custom: {
          options: async (password: string, { req }) => {
            const user = await usersControllers.checkLoginCredentials(req.body.email, password)
            if (!user) {
              throw new Error('Email or Password is incorrect')
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidation = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        notEmpty: true,
        custom: {
          options: async (accessToken: string, { req }) => {
            try {
              const token = accessToken.split(' ')[1]
              if (!token) {
                throw new UnauthorizedError()
              }
              const jwtPayload = await verifyJWT({ token })
              req.decodedAccessToken = jwtPayload
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError(error.message)
              }
              throw error
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidation = validate(
  checkSchema(
    {
      refreshToken: {
        trim: true,
        notEmpty: true,
        custom: {
          options: async (refreshToken: string, { req }) => {
            try {
              if (!refreshToken) {
                throw new UnauthorizedError('Refresh Token is required')
              }
              const jwtPayload = await verifyJWT({ token: refreshToken })
              req.decodedRefreshToken = jwtPayload
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError(error.message)
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const emailVerifyValidation = validate(
  checkSchema(
    {
      emailVerifyToken: {
        trim: true,
        notEmpty: true,
        custom: {
          options: async (emailVerifyToken: string, { req }) => {
            try {
              if (!emailVerifyToken) {
                throw new ErrorWithStatus({
                  message: 'Email Verification Token is required',
                  status: HttpStatusCode.NotFound
                })
              }
              const jwtPayload = await verifyJWT({ token: emailVerifyToken })
              req.decodedEmailVerifyToken = jwtPayload
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new Error('Email verification' + error.message)
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const changePasswordEmailValidation = validate(
  checkSchema(
    {
      email: {
        trim: true,
        notEmpty: true,
        isEmail: true,
        custom: {
          options: async (email: string, { req }) => {
            const user = await usersControllers.checkUserExisted(email)
            if (!user) {
              throw new ErrorWithStatus({ message: 'Email not found', status: HttpStatusCode.NotFound })
            }
            if (user.verify == UserVerifyStatus.Unverified) throw new ForbiddenError('Email is not verified')
            if (!canChangePassword(user.changePasswordAt, 30 * 60 * 1000))
              throw new ForbiddenError('An Email Has Been Sent To You, Please Check Your Inbox')
            // if((user as User).forgot_password_token) throw new UnauthorizedError( 'Check Email For Token')
            req.user = user
          }
        }
      }
    },
    ['body']
  )
)

export const changePasswordValidation = validate(
  checkSchema(
    {
      email: {
        trim: true,
        notEmpty: true,
        isEmail: true
      },
      forgotPasswordToken: {
        trim: true,
        notEmpty: true,
        custom: {
          options: async (forgotPasswordToken: string, { req }) => {
            try {
              if (!forgotPasswordToken) {
                throw new ForbiddenError('Token is required')
              }
              const jwtPayload = await verifyJWT({ token: forgotPasswordToken })
              if (jwtPayload) {
                if (jwtPayload.type !== TokenType.ForgotPasswordToken) throw new ForbiddenError('Invalid Token')
                req.body.userIdFromMiddleware = jwtPayload.userId
                return true
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new UnauthorizedError(error.message)
              }
              throw error
            }
          }
        }
      },
      oldPassword: {
        trim: true,
        notEmpty: true,
        isString: true
      },
      password: {
        trim: true,
        notEmpty: true,
        isString: true,
        isStrongPassword: {
          options: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage:
            'Password must be at least 8 characters long, contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol'
        },
        custom: {
          options: async (password: string, { req }) => {
            if (hashPassword(password) == hashPassword(req.body.password)) {
              throw new ForbiddenError('Password Cannot Be The Same')
            }
            req.body.password = hashPassword(password)
          }
        }
      }
    },
    ['body']
  )
)

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decodedAccessToken!
  if (verify !== UserVerifyStatus.Verified) next(new ForbiddenError('User is not verified'))
  next()
}

export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middleware(req, res, next)
    }
    next()
  }
}
