import { AppError } from '@/errors/app.error';

export class AccountAlreadyExistsError extends AppError {
  constructor(name: string) {
    super(`Account with the name "${name}" already exist.`, 409, 'ACCOUNT_ALREADY_EXIST')
  }
}

export class AccountNotFoundError extends AppError {
  constructor() {
    super(`Account doesn't exist.`, 404, 'ACCOUNT_NOT_FOUND')
  }
}

export class AccountUpdateAlreadyExistsError extends AppError {
  constructor(name: string) {
    super(`Other account with the name "${name}" already exist.`, 409, 'ACCOUNT_ALREADY_EXIST')
  }
}