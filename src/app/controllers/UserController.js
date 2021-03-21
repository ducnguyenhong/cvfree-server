const UserModel = require("../models/UserModel");
const authMiddleware = require('../helper/middle-ware-auth')
const jsonRes = require('../helper/json-response')
// const {multipleMongooseToObject, mongooseToObject} = require('../../utils/mangoose')
class UserController {
  // [GET] /users
  async showList(req, res, next) {
    await authMiddleware.isAuth(req, res, next).then(user => {
      const page = parseInt(req.query.page) || 1
      const size = parseInt(req.query.size) || 10
      const start = (page - 1) * size
      const end = page * size
      UserModel.find()
        .then(users => {
          return res.status(200).json(jsonRes.success(
            200,
            {
              items: users.slice(start, end),
              page,
              size,
              totalItems: users.length
            },
            "GET_DATA_SUCCESS"
          ))
        })
        .catch(e => {
        return res.status(400).json(jsonRes.error(400, e.message))
      })
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
