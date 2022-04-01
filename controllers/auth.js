const User = require('../models/User')

//@desc   register user
//@route  POST /api/v1/auth/register
//@access Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    // create user
    const user = await User.create({
      name,
      email,
      password,
      role
    })

    sendTokenResponse(user, 200, res)
  } catch (err) {
    res.status(400).json({ success: false })
    console.log(err.stack)
  }
}

//@desc   login user
//@route  POST /api/v1/auth/login
//@access Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, msg: 'Please provide an email and password' })
    }

    // check for user
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(400).json({ success: false, msg: 'invalid credentials' })
    }

    // check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
      return ReadableStream.status(401).json({ success: false, msg: 'invalid credentials' })
    }

    sendTokenResponse(user, 200, res)
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, msg: 'email or password cannot be converted to string' })
  }
}

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  const token = user.getSignedJwtToken()

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if (process.env.NODE_ENC === 'production') {
    options.secure = true
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token
  })
}

//@desc   get current logged in user
//@route  POST /api/v1/auth/me
//@access Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id)
  res.status(200).json({
    success: true,
    data: user
  })
}

//@dec    log user out / clear cookies
//@route  GET /api/v1/auth/logout
//@access Private
exports.logout = async (req, res, next) => {
  res
    .status(200)
    .cookie('token', 'null', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    })
    .json({
      success: true,
      data: {}
    })
}
