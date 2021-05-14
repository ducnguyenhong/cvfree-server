const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const ApplyManage = new Schema({
  userId: {type: String, required: true},
  applies: [
    {
      jobId: String,
      jobName: String,
      applyType: String,
      applyValue: String,
      applyCandidate: {
        userId: String,
        fullname: String,
      },
      status: String, // WAITING => DINIED/APPROVED => DONE,
      createdAt: Date
    }
  ]
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

ApplyManage.plugin(autoIncrement.plugin, {
  model: 'ApplyManage',
  field: 'id'
});

module.exports = mongoose.model('ApplyManage', ApplyManage)
