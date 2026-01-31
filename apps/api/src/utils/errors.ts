import { GraphQLError } from 'graphql';

export class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }
}

export class AuthorizationError extends GraphQLError {
  constructor(message: string = 'You are not authorized to perform this action') {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
        http: { status: 403 },
      },
    });
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string, field?: string) {
    super(message, {
      extensions: {
        code: 'BAD_USER_INPUT',
        field,
        http: { status: 400 },
      },
    });
  }
}

export class NotFoundError extends GraphQLError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id "${id}" not found`
      : `${resource} not found`;
    super(message, {
      extensions: {
        code: 'NOT_FOUND',
        resource,
        http: { status: 404 },
      },
    });
  }
}

export class BusinessRuleError extends GraphQLError {
  constructor(message: string, code?: string) {
    super(message, {
      extensions: {
        code: code || 'BUSINESS_RULE_VIOLATION',
        http: { status: 422 },
      },
    });
  }
}

export class DuplicateError extends BusinessRuleError {
  constructor(message: string) {
    super(message, 'DUPLICATE');
  }
}

export class RTRRequiredError extends BusinessRuleError {
  constructor(message: string = 'Valid RTR required for this operation') {
    super(message, 'RTR_REQUIRED');
  }
}
