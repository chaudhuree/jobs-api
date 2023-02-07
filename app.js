require('dotenv').config();
require('express-async-errors'); //no need any try catch for this package
const express = require('express');
const app = express();

// extra security packages
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimiter = require('express-rate-limit');

// routers
const authRouter = require('./routes/auth');
const jobsRouter = require('./routes/jobs');

// error handler
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
// extra packages


//middleware
const authenticateUser = require('./middleware/authentication'); //authentication middleware


// routes
app.get('/', (req, res) => {
  res.send('jobs api');
});

//db connection
const connectDB = require('./db/connect');

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/jobs', authenticateUser, jobsRouter); //make it protected route by adding authentication middleware


//if no route found
app.use(notFoundMiddleware);
//if error found custom error handler
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;
//run command with PORT=3000 node app.js

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
