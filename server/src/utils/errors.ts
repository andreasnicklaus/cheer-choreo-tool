export class RequestOrderError extends Error {
  name = "RequestOrderError";
}
export class NotFoundError extends Error {
  name = "NotFoundError";
}
export class FaultyInputError extends Error {
  name = "FaultyInputError";
}
export class MisconfigurationError extends Error {
  name = "MisconfigurationError";
}
export class AuthorizationError extends Error {
  name = "AuthorizationError";
}