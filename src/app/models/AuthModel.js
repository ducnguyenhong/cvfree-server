const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const Auth = new Schema({
  userId: {type: String, required: true},
  token: String,
  expiredAt: Number,
  deviceId: String
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

Auth.plugin(autoIncrement.plugin, {
  model: 'Auth',
  field: 'id'
});

module.exports = mongoose.model('Auth', Auth)
