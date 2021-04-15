const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')

const Schema = mongoose.Schema

const Job = new Schema({
  creatorId: {type: Number, required: true},
  name: { type: String, required: true },
  companyId: {type: Number},
  address: {
    value: { district: String, city: String },
    label: String
  } | null,
  career: [{ type: String}],
  recruitmentPosition: [{ type: String}],
  timeToApply: {type: Number},
  formOfWork: [{ type: String}],
  numberRecruited: {type: Number},
  genderRequirement: [{ type: String}],
  salary: {
    salaryType: String,
    salaryFrom: Number,
    salaryTo: Number,
    salaryCurrency: String,
  },
  jobDescription: String,
  requirementForCandidate: String,
  benefitToEnjoy: String,
  candidateApplied: [{
    cvId: String,
    accept: Boolean
  }],
  status: String
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

Job.plugin(autoIncrement.plugin, {
  model: 'Job',
  field: 'id'
});

module.exports = mongoose.model('Job', Job)
