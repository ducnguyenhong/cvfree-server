const User = require("../models/UserModel");
// const {multipleMongooseToObject, mongooseToObject} = require('../../utils/mangoose')
class UserController {
  // [POST] /users/sign-up
  signUp(req, res, next) {
    User.findOne({ username: req.body.username })
      .then(dataUsername => {
        if (dataUsername) {
          const response = {
            code: 409,
            data: null,
            success: false,
            message: {
              vi: 'Tài khoản đã tồn tại!',
              en: 'Username already exists!'
            }
          }
          res.status(409)
          res.json(response)
        }
        else {
          User.findOne({ email: req.body.email })
            .then(dataEmail => {
              if (dataEmail) {
                const response = {
                  code: 409,
                  data: null,
                  success: false,
                  message: {
                    vi: 'Email đã tồn tại!',
                    en: 'Email already exists!'
                  }
                }
                res.status(409)
                res.json(response)
              }
              else {
                const user = new User(req.body)
                user.save()
                  .then(() => {
                    const response = {
                      code: 201,
                      data: {
                        userInfo: user
                      },
                      success: true
                    }
                    res.status(201)
                    res.json(response)
                  })
                  .catch((e) => {
                    const response = {
                      code: 400,
                      data: null,
                      success: false,
                      message: e.message
                    }
                    res.status(400)
                    res.json(response)
                })
              }
          })
        }
      })
      .catch(next)
  }
  // [GET] /
  // index(req, res, next) {
  //   const page = parseInt(req.query.page) || 1 // n
  //   const size = parseInt(req.query.size) || 10 // x
  //   const start = (page - 1) * size
  //   const end = page * size

  //   //promise
  //   User.find({})
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

  // [GET] /courses/create
  // create(req, res, next) {
  //   res.render('courses/create')
  // }

  // [GET] / courses/:id/edit
  // showEdit(req, res, next) {
  //   Course.findById(req.params.id)
  //     .then(course => res.render('courses/update', { course: mongooseToObject(course) }))
  //   .catch(next)
  // }

  

  // [PUT] /courses/:id
  // update(req, res, next) {
  //   Course.updateOne({ _id: req.params.id }, req.body)
  //     .then(() => res.redirect('/my-courses'))
  //     .catch(next)
  // }

  // [GET] /courses/:slug
  // show(req, res, next) {
  //   Course.findOne({ slug: req.params.slug })
  //     .then(course => {
  //       res.render('courses/show', {course: mongooseToObject(course)})
  //     })
  //     .catch(next)
  // }
}

module.exports = new UserController();
