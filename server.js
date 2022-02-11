const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')

// load env vars
dotenv.config({ path: './config/config.env' })

// connect to datacase
connectDB()

// route files
const hospitals = require('./routes/hospitals')

const app = express()

// body parser
app.use(express.json())

// mount routers
app.use('/api/v1/hospitals', hospitals)

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
