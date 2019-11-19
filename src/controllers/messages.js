const messagesRouter = require('express').Router()
const fetch = require('node-fetch')
const messages = []

messagesRouter.get('/', async (req, res) => {
  try {
    const nodeUrls = String(process.env.NODE_URLS).split(';').map(addr => addr.trim() + '/messages/state')
    const requests = []
    nodeUrls.forEach(url => {
      requests.push(fetch(url).then(res => res.json()))
    })
    const results = await Promise.all(requests)
    let msgs = [...messages]
    results.forEach(result => {
      msgs = [...msgs, ...result]
    })
    res.status(200).json(msgs)
  } catch (err) {
    console.error(err)
    res.sendStatus(500)
  }
})

messagesRouter.get('/state', (req, res) => {
  res.status(200).json(messages)
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
