const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')

const auth = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization //in header.authorization we will get token
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    //token will be like, Bearer tokenCode so we use startsWith
    throw new UnauthenticatedError('Authentication invalid')
  }
  const token = authHeader.split(' ')[1]
  // after getting the token it wil be like, Bearer tokenCode so we will split it and get tokenCode from the second index of the array which is 1

  try {
    //verify the token and get the payload which is the user id and name
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // attach the user to the job routes
    req.user = { userId: payload.userId, name: payload.name } //docs: set req.user so that we can use it in the routes and get the user id and name
    next()
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid')
  }
}

module.exports = auth
