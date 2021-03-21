const mongoose = require('mongoose')

const connect = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/cvfree', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    console.log('Connected DB');
  }
  catch (error) {
    console.log('Connect DB fail', error);
  }
}

module.exports = {connect}