const User = require('../models/User')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')

//docs: registration 
const register = async (req, res) => {
  const user = await User.create({ ...req.body })// from request body we are getting name, email and password and creating user & we are getting data from postman
  const token = user.createJWT() //generate token by using user model method
  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token })//in response we are sinding user name and token
}

//docs: login 
const login = async (req, res) => {
  const { email, password } = req.body //from request body we are getting email and password

  //if email or password is not provided
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
    //if we donot use error handler then we will do this like,
    //return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please provide email and password' })
  }
  //check for user using email
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  //after getting user we will compare password
  const isPasswordCorrect = await user.comparePassword(password) //method from user model
  //if password is not correct
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  // if password is correct then we will generate token
  const token = user.createJWT() //method from user model,in token it will have user id and name
  res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
}

module.exports = {
  register,
  login,
}
