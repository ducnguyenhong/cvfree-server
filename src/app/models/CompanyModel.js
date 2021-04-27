const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const Company = new Schema({
  creatorId: {type: String, required: true},
  name: { type: String, required: true },
  taxCode: String,
  email: String,
  creator: {
    employeeIdCard: String,
    employeeIdCardId: String,
    position: {
      value: String,
      label: String
    }
  },
  logoId: String,
  phone: String,
  address: {
    value: { district: String, city: String },
    label: String,
    street: String
  } | null,
  website: String,
  personnelSize: String,
  background: String,
  backgroundId: String,
  intro: String,
  logo: String,
  status: String,
  listStaff: [
    {id: String, role: String}
  ]
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

Company.plugin(autoIncrement.plugin, {
  model: 'Company',
  field: 'id'
});

module.exports = mongoose.model('Company', Company)
