import { randomUUID } from 'crypto'
import {
  createEmployeeRecord,
  deleteEmployeeRecord,
  findEmployeeByEmail,
  findEmployeeById,
  listEmployeeRecords,
  updateEmployeeRecord,
} from '../model/admin/user.model.js'
import { hashPassword } from '../utils/password.js'
import { sanitizeEmployee } from '../utils/user.js'

const createHttpError = (message, statusCode) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

export const createUser = async (payload) => {
  const {
    first_name,
    last_name = null,
    email,
    password,
    role = 'employee',
    phone = null,
    employee_code = null,
    status = 'active',
    allowedRoles,
  } = payload

  if (!first_name || !email || !password) {
    throw createHttpError('First name, email, and password are required.', 400)
  }

  const normalizedEmail = email.trim().toLowerCase()

  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    throw createHttpError('You cannot create this user role.', 403)
  }

  const { data: existingUser, error: existingUserError } = await findEmployeeByEmail(normalizedEmail)

  if (existingUserError) {
    throw createHttpError(existingUserError.message, 500)
  }

  if (existingUser) {
    throw createHttpError('A user with this email already exists.', 409)
  }

  const password_hash = await hashPassword(password)

  const employeePayload = {
    employee_code: employee_code || `EMP-${randomUUID().slice(0, 8).toUpperCase()}`,
    role,
    status,
    first_name,
    last_name,
    email: normalizedEmail,
    phone,
    password_hash,
  }

  const { data, error } = await createEmployeeRecord(employeePayload)

  if (error) {
    throw createHttpError(error.message, 500)
  }

  return sanitizeEmployee(data)
}

export const listUsers = async (filters = {}) => {
  const { data, error } = await listEmployeeRecords(filters)

  if (error) {
    throw createHttpError(error.message, 500)
  }

  return (data ?? []).map(sanitizeEmployee)
}

export const updateUser = async ({ id, payload, allowedRoles }) => {
  const { data: existingUser, error: existingUserError } = await findEmployeeById(id)

  if (existingUserError) {
    throw createHttpError(existingUserError.message, 500)
  }

  if (!existingUser) {
    throw createHttpError('User not found.', 404)
  }

  if (allowedRoles?.length && !allowedRoles.includes(existingUser.role)) {
    throw createHttpError('You cannot update this user role.', 403)
  }

  const updatePayload = {}

  if (payload.first_name !== undefined) updatePayload.first_name = payload.first_name
  if (payload.last_name !== undefined) updatePayload.last_name = payload.last_name
  if (payload.phone !== undefined) updatePayload.phone = payload.phone
  if (payload.status !== undefined) updatePayload.status = payload.status

  if (payload.role !== undefined) {
    if (allowedRoles?.length && !allowedRoles.includes(payload.role)) {
      throw createHttpError('You cannot assign this user role.', 403)
    }

    updatePayload.role = payload.role
  }

  if (payload.email !== undefined) {
    const normalizedEmail = payload.email.trim().toLowerCase()
    if (normalizedEmail !== existingUser.email) {
      const { data: duplicateUser, error: duplicateError } = await findEmployeeByEmail(normalizedEmail)
      if (duplicateError) {
        throw createHttpError(duplicateError.message, 500)
      }
      if (duplicateUser) {
        throw createHttpError('A user with this email already exists.', 409)
      }
      updatePayload.email = normalizedEmail
    }
  }

  if (payload.password) {
    updatePayload.password_hash = await hashPassword(payload.password)
  }

  const { data, error } = await updateEmployeeRecord(id, updatePayload)

  if (error) {
    throw createHttpError(error.message, 500)
  }

  return sanitizeEmployee(data)
}

export const deleteUser = async ({ id, allowedRoles }) => {
  const { data: existingUser, error: existingUserError } = await findEmployeeById(id)

  if (existingUserError) {
    throw createHttpError(existingUserError.message, 500)
  }

  if (!existingUser) {
    throw createHttpError('User not found.', 404)
  }

  if (allowedRoles?.length && !allowedRoles.includes(existingUser.role)) {
    throw createHttpError('You cannot delete this user role.', 403)
  }

  const { data, error } = await deleteEmployeeRecord(id)

  if (error) {
    throw createHttpError(error.message, 500)
  }

  return data
}
