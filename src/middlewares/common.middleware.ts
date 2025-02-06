import { Request, Response, NextFunction } from 'express'
import { checkSchema } from 'express-validator'
import validate from '~/utils/validator'

export const filterBody = <T>(keys: (keyof T)[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const filteredBody: Partial<T> = {}

    keys.forEach((key) => {
      if (key in req.body) {
        filteredBody[key] = req.body[key]
      }
    })
    req.body = filteredBody
    next()
  }
}

export const paginationValidator = validate(
  checkSchema(
    {
      limit: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num > 100 || num < 1) {
              throw new Error('1 <= limit <= 100')
            }
            return true
          }
        }
      },
      page: {
        isNumeric: true,
        custom: {
          options: async (value, { req }) => {
            const num = Number(value)
            if (num < 1) {
              throw new Error('page >= 1')
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
