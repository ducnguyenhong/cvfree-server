const checkExistsData = async (Model, field, value) => {
  const objQuery = {}
  objQuery[`${field}`] = value
  let check = false
  await Model.findOne(objQuery)
    .then(db => {
      db && (check = true)
    }
  )
  return check
}

module.exports = checkExistsData