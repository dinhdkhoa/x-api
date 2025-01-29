import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'
import { usersControllers } from '~/controllers'
import { canChangePassword } from '~/controllers/users.controllers'
import { ErrorWithStatus, UnauthorizedError } from '~/models/errors.model'
import User from '~/models/schemas/user.schema'
import { verifyJWT } from '~/utils/jwt'
import validate from '~/utils/validator'

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
            const userId = await usersControllers.checkLoginCredentials(req.body.email, password)
            if (!userId) {
              throw new Error('Email or Password is incorrect')
            }
            req.body.userIdFromMiddleware = userId
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
            const user = await usersControllers.checkUserExisted(email, true)
            if (!user) {
              throw new ErrorWithStatus({ message: 'Email not found', status: HttpStatusCode.NotFound })
            }
            if ((user as User).verify == UserVerifyStatus.Unverified)
              throw new UnauthorizedError('Email is not verified')
            if(!canChangePassword((user as User).changePasswordAt, 30 * 60 * 1000)) throw new UnauthorizedError('An Email Has Been Sent To You, Please Check Your Inbox')
            // if((user as User).forgot_password_token) throw new UnauthorizedError( 'Check Email For Token')
            req.body.userIdFromMiddleware = (user as User)._id.toString()
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
                throw new UnauthorizedError('Token is required')
              }
              const jwtPayload = await verifyJWT({ token: forgotPasswordToken })
              if(jwtPayload){
                if(jwtPayload.type !== TokenType.ForgotPasswordToken) throw new UnauthorizedError('Invalid Token')
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
      }
    },
    ['body']
  )
)
