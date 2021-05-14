const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const Job = new Schema({
  creatorId: String,
  creator: {
    fullname: String,
    avatar: String
  },
  name: { type: String, required: true },
  company: {
    name: String,
    logo: String,
    id: String
  },
  address: {
    value: {
      city: { type: String },
      district: {type: String}
    },
    label: String
  },
  career: [{ type: String}],
  recruitmentPosition: [{ type: String}],
  timeToApply: {type: Number},
  formOfWork: [{ type: String}],
  numberRecruited: {type: Number},
  genderRequirement: [{ type: String}],
  salary: {
    salaryType: String,
    salaryFrom: String,
    salaryTo: String,
    salaryCurrency: String,
  },
  jobDescription: String,
  requirementForCandidate: String,
  benefitToEnjoy: String,
  candidateApplied: [{
    userId: String,
    applyType: String, // OTHER , CVFREE, PDF
    applyValue: String,
    appliedAt: Date,
    candidate: {
      fullname: String,
      gender: String,
      avatar: String,
    }
  }],
  status: String
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

Job.plugin(autoIncrement.plugin, {
  model: 'Job',
  field: 'id'
});

module.exports = mongoose.model('Job', Job)
