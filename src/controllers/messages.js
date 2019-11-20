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

messagesRouter.post('/receive', (req, res) => {
  const newMessage = req.body
  messages.push(newMessage)
  res.sendStatus(200)
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
    const nodeUrls = 'http://localhost:5002;http://localhost:5004'.split(';').map(addr => addr.trim() + '/messages/receive')
    const requests = []
    nodeUrls.forEach(url => {
      console.log(url)
      requests.push(fetch(url, {
        method: 'post',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' }
      }))
    })
    await Promise.all(requests)
    res.sendStatus(201)
  } catch (error) {
    res.sendStatus(500)
  }
})

module.exports = messagesRouter
