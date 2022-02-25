const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const connectDB = require('./config/db')

// load env vars
dotenv.config({ path: './config/config.env' })

// connect to datacase
connectDB()

// route files
const hospitals = require('./routes/hospitals')
const auth = require('./routes/auth')

const app = express()

// body parser
app.use(express.json())

// cookie parser
app.use(cookieParser())

// mount routers
app.use('/api/v1/hospitals', hospitals)
app.use('/api/v1/auth', auth)

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
