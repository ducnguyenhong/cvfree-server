const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

const Schema = mongoose.Schema

const Company = new Schema({
  creatorId: {type: Number, required: true},
  name: { type: String, required: true },
  taxCode: String,
  address: {
    value: { district: String, city: String },
    label: String,
    street: String
  } | null,
  website: String,
  personnelSize: {
    from: String,
    to: String
  },
  background: String,
  intro: String,
  logo: String,
  status: String
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

Company.plugin(autoIncrement.plugin, {
  model: 'Company',
  field: 'id'
});

module.exports = mongoose.model('Company', Company)
