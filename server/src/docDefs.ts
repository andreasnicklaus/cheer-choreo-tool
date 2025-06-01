/**
 * @swagger
 * components:
 *  securitySchemes:
 *    userAuthentication:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *  responses:
 *    UnauthorizedError:
 *      description: Unauthorized
 *  schemas:
 *    JWT:
 *      type: string
 *      example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
 * security:
 *   - userAuthentication: []
 */

/**
 * @typedef {string} UUID
 * @memberof module:Models
 */