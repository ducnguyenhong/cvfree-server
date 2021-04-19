const resError = (res, message, code) => {
  return res.status(code || 400).json({
    code: code || 400,
    data: null,
    success: false,
    error: {message}
  })
}

module.exports = resError