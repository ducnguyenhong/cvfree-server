const mongoose = require('mongoose')

const Schema = mongoose.Schema

const SignUp = new Schema({
  username: {type: String, maxlength: 15, required: true},
  password: { type: String, maxlength: 40, required: true },
  email: { type: String, maxlength: 40, required: true },
  type: {type: String, maxlength: 20, required: true}
}, {timestamps: true}) // auto generate createdAt, updatedAt

module.exports = mongoose.model('SignUp', SignUp)
