import { checkSchema } from 'express-validator'
import { usersControllers } from '~/controllers'
import User from '~/models/user.schema'
import validate from '~/utils/validator'

checkSchema({})

export const registerValidation = validate(
  checkSchema({
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
      },
      
    }
  })
)
