const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const CandidateManage = new Schema({
  employerId: {type: String, required: true},
  candidates: [
    {
      jobId: String,
      jobName: String,
      cvId: String,
      candidateFullname: String,
      isDone: Boolean,
      candidateId: String,
      createdAt: Date
    }
  ]
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

CandidateManage.plugin(autoIncrement.plugin, {
  model: 'CandidateManage',
  field: 'id'
});

module.exports = mongoose.model('CandidateManage', CandidateManage)
