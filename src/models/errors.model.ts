import { ValidationError } from "express-validator"
import { HttpStatusCode } from "~/constants/HttpStatusCode.enum"

export class ErrorWithStatus {
  status: number
  message: string

  constructor({ status, message }: { status: number, message: string }) {
    this.status = status
    this.message = message
  }
}

export class EntityError extends ErrorWithStatus {
  errors: Record<string, ValidationError>

  constructor(errors: Record<string, ValidationError>) {
    super({ status: HttpStatusCode.UnprocessableEntity, message : 'Validation Errors' })
    this.errors = errors
  }
}

export class UnauthorizedError extends ErrorWithStatus {
  errors?: Record<string, any>

  constructor(message?: string, errors?: Record<string, any> ) {
    super({ status: HttpStatusCode.Unauthorized, message: message || 'Unauthorized' })
    this.errors = errors
  }
}
export class ForbiddenError extends ErrorWithStatus {
  errors?: Record<string, any>

  constructor(message?: string, errors?: Record<string, any> ) {
    super({ status: HttpStatusCode.Forbidden, message: message || 'Forbidden' })
    this.errors = errors
  }
}