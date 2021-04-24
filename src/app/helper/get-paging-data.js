const getQueryParams = require('./get-query-params')

const getPagingData = (req, data, no_doc) => {
  const { page, size } = getQueryParams(req)
  const start = (page - 1) * size
  const end = page * size
  let totalPages = 0;

  if (data.length <= size) {
    totalPages = 1
  }
  if (data.length > size) {
    totalPages = (data.length % size === 0) ? (data.length / size) : Math.ceil(data.length / size) + 1
  }

  const dataRes = data.slice(start, end).map(item => {
    const { __v, ...data } = no_doc ? item : item._doc
    return data
  })

  return {
    dataPaging: dataRes,
    pagination: {page, size, totalPages, totalItems: data.length}
  }
}

module.exports = getPagingData