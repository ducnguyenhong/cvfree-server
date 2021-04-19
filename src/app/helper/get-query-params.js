const getQueryParams = (req) => {
  const page = parseInt(req.query.page) || 1
  const size = parseInt(req.query.size) || 10
  const {type, status, keyword, verify} = req.query
  return {type, status, keyword, verify, page, size}
}

module.exports = getQueryParams