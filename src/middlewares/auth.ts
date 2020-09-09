import { Response, NextFunction } from 'express'

import path from 'path'
import jwt from 'jsonwebtoken'
import IRequest from '../interfaces/HttpRequest'

require('dotenv').config({
  path: process.env.NODE_ENV === 'test'
    ? path.join(__dirname, '../../.env.test')
    : path.join(__dirname, '../../.env')
})

async function auth (request: IRequest, response: Response, next: NextFunction) : Promise<void | Response> {
  try {
    const authorization = request.header('Authorization')

    const [, token] = authorization.split(' ')

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId }

    request.userId = decoded.userId

    return next()
  } catch (error) {
    return response.status(403).send({ message: 'Forbidden' })
  }
}

export default auth
