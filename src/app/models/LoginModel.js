const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Login = new Schema({
  username: {type: String, maxlength: 15, required: true},
  deveiceId: { type: String, maxlength: 255 },
  password: {type: String, maxlength: 14}
}, {timestamps: true}) // auto generate createdAt, updatedAt

module.exports = mongoose.model('Login', Login)
