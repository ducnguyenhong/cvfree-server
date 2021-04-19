const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Location = new Schema({
  id: {type: String},
  code: {type: String},
  name: {type: String},
  districts: Array
}, { timestamps: false })

module.exports = mongoose.model('Location', Location)
