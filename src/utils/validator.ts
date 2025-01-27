import express from 'express'
import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { HttpStatusCode } from '~/constants/HttpStatusCode.enum'
import { EntityError, ErrorWithStatus } from '~/models/errors.model'

// can be reused by many routes
const validate = (validations: RunnableValidationChains<ValidationChain>) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await validations.run(req)

    const errors = validationResult(req)
    if (errors.isEmpty()) return next()

    const errorsMap = errors.mapped()
    const entityErrors = new EntityError({})
    for (const key in errorsMap) {
      const {msg} = errorsMap[key]
      if(msg instanceof ErrorWithStatus && msg.status !== HttpStatusCode.UnprocessableEntity) {
        return next(msg)
      }
      entityErrors.errors[key] = errorsMap[key]
    }

    return next(entityErrors)

  }
}

export default validate
