const messagesRouter = require('express').Router()
const messages = []

messagesRouter.get('/', async (req, res) => {
  res.json(messages)
})

messagesRouter.post('/', async (req, res) => {
  if (req.body.name === undefined || req.body.message === undefined) {
    res.sendStatus(400)
  }
  try {
    const message = {
      time: Date.now(),
      name: req.body.name,
      message: req.body.message
    }
    messages.push(message)
    res.sendStatus(201)
  } catch (error) {
    res.sendStatus(500)
  }
})

module.exports = messagesRouter
