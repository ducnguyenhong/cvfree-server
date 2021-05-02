const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const ReportJob = new Schema({
  reporter: {
    id: String,
    avatar: String,
    fullname: String,
    phone: String,
    email: String,
  },
  content: String,
  creator: {
    id: String,
    fullname: String,
    phone: String,
    email: String,
    avatar: String
  },
  company: {
    id: String,
    name: String,
    logo: String
  },
  expiredAt: Date,
  processStatus: String,
  job: {
    id: String,
    name: String
  },
  status: String
}, { timestamps: true }) 

autoIncrement.initialize(mongoose.connection);

ReportJob.plugin(autoIncrement.plugin, {
  model: 'ReportJob',
  field: 'id'
});

module.exports = mongoose.model('ReportJob', ReportJob)
