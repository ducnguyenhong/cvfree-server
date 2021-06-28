const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const User = new Schema({
  // username: {type: String, maxlength: 14, required: true},
  // password: { type: String, maxlength: 50, required: true },
  deviceId: { type: String, maxlength: 50 },
  // email: { type: String, maxlength: 30, required: true },
  // address: {
  //   value: {
  //     city: { type: String },
  //     district: {type: String}
  //   },
  //   label: String
  // },
  // birthday: { type: Date },
  // verify: {type: Boolean},
  // coin: { type: Number },
  companyId: { type: String },
  isAdminOfCompany: Boolean,
  // beWarned: Boolean,
  // country: { type: String, maxlength: 255 },
  // fullname: { type: String, maxlength: 255 },
  // gender: { type: String, maxlength: 6 },
  // id: { type: Number},
  // phone: { type: String, maxlength: 20 },
  // status: { type: String, maxlength: 10 },
  // type: { type: String, maxlength: 15, required: true },
  // avatar: { type: String, maxlength: 255 },
  // avatarId: String,
  // seeCV: { type: Boolean },
  // findJob: { type: Boolean },
  // listCV: [{type: String}],
  // typeAccount: { type: String, maxlength: 20 },
  // numberOfCreateCv: Number, // Candidate
  // numberOfPosting: Number, // Employer
  // numberOfRequestUpdateCompany: Number, // Employer but not Admin of company
  // numberOfCandidateOpening: Number, // Employer
  // numberOfReportJob: Number // Employer but not Creator of Job, Candidate
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

User.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'id'
});

module.exports = mongoose.model('User', User)
