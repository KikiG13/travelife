const mongoose = require('mongoose')

const destinationSchema = new mongoose.Schema({
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  comment: {
    type: String
  },
  favoriteDish: {
    type: String
  },
  site1: {
    type: String
  },
  site2: {
    type: String
  },
  site3: {
    type: String
  },
  photo: {
    type: String
  },
  rating: {
    type: Number
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Destination', destinationSchema)
