const Appointment = require('../models/Appointment')
const Hospital = require('../models/Hospital')

//@desc   Get all appointments
//@route  GET /api/v1/appointments
//@access Public
exports.getAppointments = async (req, res, next) => {
  let query
  // general users can see only their appointment
  if (req.user.role !== 'admin') {
    query = Appointment.find({ user: req.user.id })
      .populate({
        path: 'hospital',
        select: 'name province tel'
      })
      .populate({
        path: 'user',
        select: 'name'
      })
  } else {
    // admin users can see all appointments
    if (req.params.hospitalId) {
      query = Appointment.find({ hospital: req.params.hospitalId })
        .populate({
          path: 'hospital',
          select: 'name province tel'
        })
        .populate({
          path: 'user',
          select: 'name'
        })
    } else {
      query = Appointment.find()
        .populate({
          path: 'hospital',
          select: 'name province tel'
        })
        .populate({
          path: 'user',
          select: 'name'
        })
    }
  }

  try {
    const appointments = await query

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    })
  } catch (err) {
    console.log(err.stack)
    return res.status(500).json({ success: false, message: 'Appointment is not found' })
  }
}

//@desc   Get signle appointment
//@route  GET /api/v1/appointments/:id
//@access Public
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'hospital',
        select: 'name description tel'
      })
      .populate({
        path: 'user',
        select: 'name'
      })

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: `No appointment with the id of ${req.params.id}` })
    }

    res.status(200).json({
      success: true,
      data: appointment
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Appointment is not found' })
  }
}

//@desc   Add appointment
//@route  POST /api/v1/hospitals/:hospitalId/appointment
//@access Private
exports.addAppointment = async (req, res, next) => {
  try {
    req.body.hospital = req.params.hospitalId
    const hospital = await Hospital.findById(req.params.hospitalId)

    if (!hospital) {
      return res
        .status(404)
        .json({ success: false, message: `No hospital with the id of ${req.params.hospitalId}` })
    }
    // add user Id to req.body
    req.body.user = req.user.id
    // check for existed appointment of the user
    const existedAppointment = await Appointment.find({ user: req.user.id })
    // if the user is not an admin, they can only create 3 appointments.
    if (existedAppointment.length >= 3 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 appointments`
      })
    }
    const appointment_temp = await Appointment.create(req.body)
    const appointment = await Appointment.findById(appointment_temp._id.toString())
      .populate({
        path: 'hospital',
        select: 'name province tel'
      })
      .populate({
        path: 'user',
        select: 'name'
      })
    res.status(200).json({
      success: true,
      data: appointment
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Appointment cannot be created' })
  }
}

//@desc   Update appointment
//@route  PUT /api/v1/appointments/:id
//@access Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: `No appointment with the id of ${req.params.id}` })
    }

    // make sure user is the appointment owner
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this appointment`
      })
    }

    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate({
        path: 'hospital',
        select: 'name province tel'
      })
      .populate({
        path: 'user',
        select: 'name'
      })

    res.status(200).json({
      success: true,
      data: appointment
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Appointment cannot be updated' })
  }
}

//@desc   Delete appoint
//@route  DELETE /api/vi/appointments/:id
//@access Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: `No appointment with the id of ${req.params.id}` })
    }

    // make sure user is the appointment owner
    if (appointment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this appointment`
      })
    }

    await appointment.remove()

    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Appointment cannot be deleted' })
  }
}
