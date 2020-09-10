import { Router } from 'express'

import UserController from '../controllers/UserController'
import auth from '../middlewares/auth'

const routes = Router()

routes.post('/register', function (request, response) {
  return UserController.register(request, response)
})

routes.post('/authenticate', function (request, response) {
  return UserController.authenticate(request, response)
})

routes.post('/forgot-password', function (request, response) {
  return UserController.forgotPassword(request, response)
})

// Protected Routes
routes.use(auth)

routes.get('/user/:id', function (request, response) {
  return response.status(200).send({ message: 'Hello' })
})

export default routes
