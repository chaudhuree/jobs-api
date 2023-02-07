const Job = require('../models/Job')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')

//docs: get all jobs

const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId }).sort('createdAt')
  res.status(StatusCodes.OK).json({ jobs, count: jobs.length })
}
//docs: get a job

const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId }, //destructure the id from the params and rename it to jobId
  } = req

  //note: 🔼🔼 destructure the user id from the request , it was set in the authentication middleware
  //getting the id from the params.

  const job = await Job.findOne({
    _id: jobId,   //note: find the job by id it is _id not just id
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

//docs: create a job
const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId 
  //from body we will get all job related field value
  //but we need to add user id to the job so that we can get the job created by the user
  //as it is protected route so after authentication we will have the user id in the request.user as userId which is set in the authentication middleware
  //so we will add this to the req.body here so that we can create job with it without writing it in the create 🔽🔽
  //without upper line the code will be like this
  // const job = await Job.create({ ...req.body, createdBy: req.user.userId })
  const job = await Job.create(req.body)
  res.status(StatusCodes.CREATED).json({ job })
}

//docs: update a job
const updateJob = async (req, res) => {
  const {
    body: { company, position }, //in the body we will get company and position
    user: { userId }, //in the user we will get the user id from authentication middleware
    params: { id: jobId }, //in the params we will get the id and rename it to jobId
  } = req

  if (company === '' || position === '') {
    throw new BadRequestError('Company or Position fields cannot be empty')
  }
  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  )
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

//docs: delete job
const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findByIdAndRemove({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).send("job deleted successfully")
}

module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
}
