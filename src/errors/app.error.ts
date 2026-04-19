import { ContentfulStatusCode } from 'hono/utils/http-status';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: ContentfulStatusCode,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NoFieldsToUpdateError extends AppError {
  constructor() {
    super(`No fields to update.`, 400, 'NO_FIELDS_TO_UPDATE')
  }
}