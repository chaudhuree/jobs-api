const mongoose = require('mongoose')
const bcrypt = require('bcryptjs') // for hashing password
const jwt = require('jsonwebtoken') // for creating token

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    maxlength: 50,
    minlength: 3,
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true, // email should be unique, so that no one can register with same email
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    //we will avoid giving max length ,so that there creates no problem for bcrypt
  },
})

// Hashing password before saving
UserSchema.pre('save', async function () {
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Creating JWT token
// we will create it here so that the controller will be clean
// it is a method of UserSchema so when we call it in controller we will have out token there
UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, name: this.name }, //in token we will save user id and name
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  )
}

//in case of login we will compare password with the one in database
//canditatePassword is the password that user entered in login form
UserSchema.methods.comparePassword = async function (canditatePassword) {
  const isMatch = await bcrypt.compare(canditatePassword, this.password)
  return isMatch
}

module.exports = mongoose.model('User', UserSchema)
