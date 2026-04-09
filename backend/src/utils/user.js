export const sanitizeEmployee = (employee) => {
  if (!employee) {
    return null
  }

  const { password_hash, ...safeEmployee } = employee
  return safeEmployee
}
