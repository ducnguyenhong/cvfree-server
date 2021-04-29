const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const RequestUpdateCompany = new Schema({
  userRequest: {
    id: String,
    fullname: String,
    avatar: String
  },
  content: {
    name: String,
    taxCode: String,
    email: String,
    logoId: String,
    phone: String,
    address: {
      value: {
        city: { value: String, label: String},
        district: { value: String, label: String },
        street: String
      },
      label: String
    } | null,
    website: String,
    personnelSize: String,
    background: String,
    backgroundId: String,
    intro: String,
    logo: String,
  },
  status: String
}, { timestamps: true })

autoIncrement.initialize(mongoose.connection);

RequestUpdateCompany.plugin(autoIncrement.plugin, {
  model: 'RequestUpdateCompany',
  field: 'id'
});

module.exports = mongoose.model('RequestUpdateCompany', RequestUpdateCompany)
