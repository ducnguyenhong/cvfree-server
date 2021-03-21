const success = (code, data, message) => {
  return { code, data, success: true, message }
}

const error = (code, message) => {
  return {code, data: null, success: false, error: {message}}
}

module.exports = { success, error }