const LoginModel = require("../models/LoginModel");
// const {multipleMongooseToObject, mongooseToObject} = require('../../utils/mangoose')

class SiteController {
  // [POST] /
  // index(req, res, next) {
  //   const page = parseInt(req.query.page) || 1 // n
  //   const size = parseInt(req.query.size) || 10 // x
  //   const start = (page - 1) * size
  //   const end = page * size

  //   //promise
  //   LoginModel.find({})
  //     .then(courses => {
  //       const data = multipleMongooseToObject(courses)
  //       const coursesPaginate = data.slice(start, end)
  //       res.render('home', { courses: coursesPaginate })
  //     })
  //       // const totalItems = data.count((err, count) => {
  //       //   if (err) {
  //       //     next()
  //       //   }
  //       //   return count
  //       // })
  //     //   const response = {
  //     //     code: 200,
  //     //     data: {
  //     //       items: coursesPaginate,
  //     //       page,
  //     //       size,
  //     //       totalItems: data.length
  //     //     },
  //     //     success: true
  //     //   }
  //     //   console.log('ducnh', response);
  //     //   res.json(response)
  //     // })
  //     .catch(next)
  // }

  // [POST] /courses/upload
  // upload(req, res, next) {
  //   console.log('res', req);
  // }

  // // [GET] /courses/create
  // create(req, res, next) {
  //   res.render('courses/create')
  // }

  // [GET] / courses/:id/edit
  login(req, res, next) {
    LoginModel.findById(req.params.id)
      .then(course => res.json(course))
    .catch(next)
  }

  // [POST] /courses/store
  // store(req, res, next) {
  //   const course = new LoginModel(req.body)
  //   course.save()
  //     .then(() => res.redirect('/'))
  //   .catch(next)
  // }

  // // [PUT] /courses/:id
  // update(req, res, next) {
  //   LoginModel.updateOne({ _id: req.params.id }, req.body)
  //     .then(() => res.redirect('/my-courses'))
  //     .catch(next)
  // }

  // // [GET] /courses/:slug
  // show(req, res, next) {
  //   LoginModel.findOne({ slug: req.params.slug })
  //     .then(course => {
  //       res.render('courses/show', {course: mongooseToObject(course)})
  //     })
  //     .catch(next)
  // }
}

module.exports = new SiteController();
