const mongoose = require('mongoose')

const Schema = mongoose.Schema

const User = new Schema({
  username: {type: String, maxlength: 14, required: true},
  password: { type: String, maxlength: 50, required: true },
  deviceId: { type: String, maxlength: 50 },
  email: { type: String, maxlength: 30, required: true },
  address: { type: String, maxlength: 255 },
  birthday: { type: Number },
  coin: { type: Number },
  country: { type: String, maxlength: 255 },
  fullname: { type: String, maxlength: 255 },
  gender: { type: String, maxlength: 6 },
  id: { type: Number},
  phone: { type: String, maxlength: 20 },
  status: { type: String, maxlength: 10 },
  type: { type: String, maxlength: 15, required: true },
  avatar: {type: String, maxlength: 255}
}, {timestamps: true}) // auto generate createdAt, updatedAt

module.exports = mongoose.model('User', User)
