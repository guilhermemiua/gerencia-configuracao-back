import { Response } from 'express'

import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

import connection from '../database/connection'
import IRequest from '../interfaces/HttpRequest'

class UserController {
  async register (request: IRequest, response: Response): Promise<Response> {
    try {
      const { username, email, password } = request.body

      // Verify if username is already registered
      const existsUsername = await connection
        .select('username')
        .where('username', username)
        .from('users')
        .first()

      if (existsUsername) {
        return response.status(400).send({ message: 'Username is already registered.' })
      }

      // Verify if e-mail is already registered
      const existsEmail = await connection
        .select('id', 'username', 'email')
        .where('email', email)
        .from('users')
        .first()

      if (existsEmail) {
        return response.status(400).send({ message: 'E-mail is already registered.' })
      }

      // Hashing password
      const hashPassword = await bcrypt.hash(password, 10)

      const role = await connection
        .select('id')
        .where('name', 'user')
        .from('roles')
        .first()

      const user = await connection
        .returning(['id', 'username', 'email'])
        .insert({
          username,
          email,
          password: hashPassword,
          // eslint-disable-next-line @typescript-eslint/camelcase
          role_id: role.id
        })
        .into('users')

      return response.status(201).send(user[0])
    } catch (error) {
      return response.status(500).send({ message: 'Error' })
    }
  }

  async authenticate (request: IRequest, response: Response): Promise<Response> {
    try {
      const { email, password } = request.body

      const user = await connection
        .select(['id', 'password'])
        .where('email', email)
        .from('users')
        .first()

      // Never tell the user if the e-mail is incorrect or the password
      if (!user) {
        return response.status(404).send({ message: 'E-mail or Password incorrect.' })
      }

      // Authenticate user password
      const isValidPassword = await bcrypt.compare(password, user.password)

      // Never tell the user if the e-mail is incorrect or the password
      if (!isValidPassword) {
        return response.status(400).send({ message: 'E-mail or Password incorrect.' })
      }

      // Generate JWT Token and return
      const token = await jwt.sign({ userId: user.id }, process.env.JWT_SECRET)

      return response.status(201).send({ token: token })
    } catch (error) {
      return response.status(500).send({ message: 'Error' })
    }
  }

  async forgotPassword (request: IRequest, response: Response): Promise<Response> {
    try {
      const { email } = request.body

      if (!email) {
        return response.status(404).send({ message: 'E-mail not provided.' })
      }

      const user = await connection
        .select(['id', 'password'])
        .where('email', email)
        .from('users')
        .first()

      if (!user) {
        return response.status(404).send({ message: 'E-mail or Password incorrect.' })
      }

      const testAccount = await nodemailer.createTestAccount()

      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      })

      await transporter.sendMail({
        from: '"Gerencia de Configuração" <foo@example.com>',
        to: `${email}, ${email}`,
        subject: 'Gerência de Configuração',
        text: 'Senha',
        html: `<h1>Sua senha é: ${user.password}</h1>`
      })

      return response.status(200).send()
    } catch (error) {
      return response.status(500).send({ message: 'Error' })
    }
  }
}

export default new UserController()
