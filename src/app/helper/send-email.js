const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cvfreecontact@gmail.com',
    pass: 'protoncf291'
  }
});

const sendEmail = async (mailOptions) => {
  return await transporter.sendMail(mailOptions, (error, info) => {
    console.log('ducnh1', info);
    if (!error) {
      return {
        result: true,
        info
      }
    }
    else {
      return {
        result: false,
        error
      }
    }
  });
};

module.exports = sendEmail