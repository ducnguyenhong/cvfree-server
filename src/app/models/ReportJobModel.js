const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const ReportJob = new Schema({
  reporter: {
    fullname: String,
    phone: String,
    email: String,
    content: String
  },
  job: {
    id: String
  },
  status: String
}, { timestamps: true }) 

autoIncrement.initialize(mongoose.connection);

ReportJob.plugin(autoIncrement.plugin, {
  model: 'ReportJob',
  field: 'id'
});

module.exports = mongoose.model('ReportJob', ReportJob)
