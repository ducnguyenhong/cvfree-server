const resSuccess = (res, data, message, code) => {
  return res.status(code || 200).json({
    code: code || 200,
    data,
    success: true,
    message: message || 'GET_DATA_SUCCESS'
  })
}

module.exports = resSuccess