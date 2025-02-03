import { Request, Response, NextFunction } from 'express'

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
