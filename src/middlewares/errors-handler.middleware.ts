import { Request, Response, NextFunction } from 'express'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'
import { capitalizeFirstLetter } from '~/utils'

export const errorHandlerMiddleware =  (err: any, req: Request, res: Response, next: NextFunction) => {
  if(err.status){
    const {status , ...error} = err
    res.status(status).json({ message:capitalizeFirstLetter(err.message), ...error})
    return
  }
  res.status(HttpStatusCode.InternalServerError).json({ message: capitalizeFirstLetter(err.message)})
}