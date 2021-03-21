const mongoose = require('mongoose')

const Schema = mongoose.Schema

const SignIn = new Schema({
  username: {type: String, maxlength: 15, required: true},
  deveiceId: { type: String, maxlength: 255, required: true },
  password: {type: String, maxlength: 40, required: true}
}, {timestamps: true}) // auto generate createdAt, updatedAt

module.exports = mongoose.model('SignIn', SignIn)
