import { RequestHandler } from "express";
import { Request, Response, NextFunction } from 'express'


export const errorHandler = <P>(fn: RequestHandler<P>) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}