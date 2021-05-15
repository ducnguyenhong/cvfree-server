const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const CandidateManage = new Schema({
  employerId: {type: String, required: true},
  candidates: [
    {
      jobId: String,
      jobName: String,
      userId: String,
      applyType: String,
      applyValue: String,
      candidate: {
        fullname: String,
        avatar: String,
        gender: String,
        email: String,
        phone: String,
        address: {
          value: {
            city: { type: String },
            district: {type: String}
          },
          label: String
        } | null | undefined,
      },
      isDone: Boolean,
      createdAt: Date,
      status: String
    }
  ]
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

CandidateManage.plugin(autoIncrement.plugin, {
  model: 'CandidateManage',
  field: 'id'
});

module.exports = mongoose.model('CandidateManage', CandidateManage)
