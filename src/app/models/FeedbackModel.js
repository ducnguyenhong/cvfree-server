const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const Feedback = new Schema({
  fullname: String,
  contact: String,
  content: String,
  status: String
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

Feedback.plugin(autoIncrement.plugin, {
  model: 'Feedback',
  field: 'id'
});

module.exports = mongoose.model('Feedback', Feedback)
