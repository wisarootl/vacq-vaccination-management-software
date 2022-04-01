const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')
const mongoSanitize = require('express-mongo-sanitize') // ! add more
const helmet = require('helmet') // ! add more
const xss = require('xss-clean') // ! add more
const rateLimit = require('express-rate-limit') // ! add more
const hpp = require('hpp') // ! add more
const cors = require('cors') // ! add more

// load env vars
dotenv.config({ path: './config/config.env' })

// connect to datacase
connectDB()

// route files
const hospitals = require('./routes/hospitals')
const auth = require('./routes/auth')
const appointments = require('./routes/appointments')

const app = express()

// body parser
app.use(express.json())

// cookie parser
app.use(cookieParser())

// sanitize data
app.use(mongoSanitize()) // ! add more

// set security headers
app.use(helmet()) // ! add more

// prevent XSS attacks
app.use(xss()) // ! add more

// rate limiting
// < 100 times API call per 10 mins
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, // 10 mins
  max: 100
})
app.use(limiter) // ! add more

// prevent http param pollutions
app.use(hpp()) // ! add more

// enable CORS
app.use(cors()) // ! add more

// mount routers
app.use('/api/v1/hospitals', hospitals)
app.use('/api/v1/auth', auth)
app.use('/api/v1/appointments', appointments)

const PORT = process.env.PORT || 5000
const server = app.listen(
  PORT,
  console.log('Server running in ', process.env.NODE_ENV, ' mode on port', PORT)
)

// handle unhandled promise rejections
process.on('unhandleRejection', (err, promise) => {
  console.log(`Error: ${err.message}`)
  // close server & exit process
  server.close(() => process.exit(1))
})
