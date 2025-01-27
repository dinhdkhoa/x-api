import { RequestHandler } from "express";
import { Request, Response, NextFunction } from 'express'


export const errorHandler = (fn: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}