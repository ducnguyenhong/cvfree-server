const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
const Schema = mongoose.Schema

const Cv = new Schema({
  creatorId: String,
  creator: {
    avatar: String,
    fullname: String,
    username: String
  },
  color: { type: String, maxlength: 10, required: true },
  template: {
    value: String,
    label: String
  },
  fontSize: { type: String, maxlength: 10, required: true },
  fontFamily: { type: String, maxlength: 50, required: true },
  isPrimary: {type: Boolean},
  name: { type: String },
  formOfWork: [{type: String}],
  language: String,
  unlockedEmployers: [{type: Number}],
  career: {
    value: { type: String },
    label: {type: String}
  },
  categoryInfo: [{
    name: { type: String }
  }],
  categoryCV: [{
    name: { type: String }
  }],
  candidateId: { type: String },
  detail: {
    type: {
      fullname: {type: String, required: true},
      avatar: { type: String },
      avatarId: String,
      applyPosition: { type: String },
      birthday: { type: Number },
      gender: {type: String},
      phone: {type: String},
      address: {
        value: {
          city: { type: String },
          district: {type: String}
        },
        label: String
      },
      email: {type: String},
      facebook: { type: String },
      hobby: { type: String },
      careerGoals: { type: String },
      basicSkill: [{
        name: { type: String },
          star: {type: Number}
      }],
      education: [{
        name: { type: String },
          major: {type: String}
      }],
      workExperience: [{
        companyName: { type: String },
          position: { type: String },
          time: { type: String },
          description: {type: String}
      }],
      advancedSkill: [{
        name: { type: String },
          description: {type: String}
      }],
      activity: [{
        name: { type: String },
          time: {type: String}
      }],
      certificate: [{
        name: { type: String }
      }],
      award: [{
        name: { type: String }
      }],
      anotherInfo: [{
        info: { type: String }
      }],
      presenter: [{
        name: { type: String },
          company: { type: String },
          position: { type: String },
          phone: {type: String}
      }],
    }
  },
  status: {type: String}
}, { timestamps: true }) // auto generate createdAt, updatedAt

autoIncrement.initialize(mongoose.connection);

Cv.plugin(autoIncrement.plugin, {
  model: 'Cv',
  field: 'id'
});

module.exports = mongoose.model('Cv', Cv)
