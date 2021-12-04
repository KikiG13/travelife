// Express docs: http://expressjs.com/en/api.html
const express = require('express')
// Passport docs: http://www.passportjs.org/docs/
const passport = require('passport')

// pull in Mongoose model for destinations
const Destination = require('../models/destination')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existent document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { destination: { title: '', text: 'foo' } } -> { destination: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /destinations
router.get('/destinations', requireToken, (req, res, next) => {
  Destination.find()
    .populate('owner')
    // respond with status 200 and JSON of the destinations
    .then(destinations => res.status(200).json({ destinations: destinations }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /destinations/5a7db6c74d55bc51bdf39793
router.get('/destinations/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Destination.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "destination" JSON
    .then(destination => res.status(200).json({ destination: destination }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /destinations
router.post('/destinations', requireToken, (req, res, next) => {
  // set owner of new destination to be current user
  req.body.destination.owner = req.user.id

  Destination.create(req.body.destination)
    // respond to successful `create` with status 201 and JSON of new "destination"
    .then(destination => {
      res.status(201).json({ destination })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /destinations/5a7db6c74d55bc51bdf39793
router.patch('/destinations/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
  delete req.body.destination.owner

  Destination.findById(req.params.id)
    .then(handle404)
    // ensure the signed in user (req.user.id) is the same as the destination's owner (destination.owner)
    .then(destination => requireOwnership(req, destination))
    // updating destination object with destinationData
    .then(destination => destination.updateOne(req.body.destination))
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /destinations/5a7db6c74d55bc51bdf39793
router.delete('/destinations/:id', requireToken, (req, res, next) => {
  Destination.findById(req.params.id)
    .then(handle404)
    // ensure the signed in user (req.user.id) is the same as the destination's owner (destination.owner)
    .then(destination => requireOwnership(req, destination))
    // delete destination from mongodb
    .then(destination => destination.deleteOne())
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
