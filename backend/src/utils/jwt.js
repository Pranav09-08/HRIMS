import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET || 'hrims-development-secret'

export const signAuthToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: '7d' })
}

export const verifyAuthToken = (token) => {
  return jwt.verify(token, jwtSecret)
}
