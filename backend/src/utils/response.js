export const successResponse = (message, data = null) => ({
  success: true,
  message,
  data,
})

export const errorResponse = (message, data = null) => ({
  success: false,
  message,
  data,
})
