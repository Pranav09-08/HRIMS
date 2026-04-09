import { verifyAuthToken } from '../utils/jwt.js'

export const requireAuth = (req, res, next) => {
  const authorizationHeader = req.headers.authorization

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required.',
    })
  }

  const token = authorizationHeader.split(' ')[1]

  try {
    const decoded = verifyAuthToken(token)
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    })
  }
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required.',
    })
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource.',
    })
  }

  return next()
}
