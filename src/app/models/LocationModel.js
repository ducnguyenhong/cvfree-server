const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Location = new Schema({
  id: String,
  code: String,
  name: String,
  districts: Array
}, { timestamps: false })

module.exports = mongoose.model('Location', Location)
