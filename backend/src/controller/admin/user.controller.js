import { createUser, deleteUser, listUsers, updateUser } from '../../services/user.service.js'

const ALLOWED_ADMIN_ROLES = ['hr', 'manager', 'employee']

export const createAdminUser = async (req, res) => {
  try {
    if (!ALLOWED_ADMIN_ROLES.includes(req.body?.role)) {
      return res.status(400).json({
        success: false,
        message: 'Admin can only create HR or Manager users.',
      })
    }

    const user = await createUser({ ...req.body, allowedRoles: ALLOWED_ADMIN_ROLES })

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: user,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create user.',
    })
  }
}

export const updateAdminUser = async (req, res) => {
  try {
    const user = await updateUser({
      id: req.params.id,
      payload: req.body,
      allowedRoles: ALLOWED_ADMIN_ROLES,
    })

    return res.json({
      success: true,
      message: 'User updated successfully.',
      data: user,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update user.',
    })
  }
}

export const deleteAdminUser = async (req, res) => {
  try {
    await deleteUser({ id: req.params.id, allowedRoles: ALLOWED_ADMIN_ROLES })

    return res.json({
      success: true,
      message: 'User deleted successfully.',
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to delete user.',
    })
  }
}

export const getAdminUsers = async (req, res) => {
  try {
    const users = await listUsers({ role: req.query.role })

    return res.json({
      success: true,
      message: 'Users fetched successfully.',
      data: users,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch users.',
    })
  }
}
