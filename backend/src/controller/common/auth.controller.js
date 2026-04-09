import { loginWithPassword } from '../../services/auth.service.js'

export const login = async (req, res) => {
  try {
    const result = await loginWithPassword(req.body)

    return res.json({
      success: true,
      message: 'Login successful.',
      data: result,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Login failed.',
    })
  }
}

export const logout = async (_req, res) => {
  return res.json({
    success: true,
    message: 'Logout successful.',
  })
}
