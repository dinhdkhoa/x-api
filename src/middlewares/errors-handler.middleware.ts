import { Request, Response, NextFunction } from 'express'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'

export const errorHandlerMiddleware =  (err: any, req: Request, res: Response, next: NextFunction) => {
  if(err.status){
    const {status , ...error} = err
    res.status(status).json({ message: err.message, ...error})
    return
  }
  res.status(HttpStatusCode.InternalServerError).json({ message: err.message})
}